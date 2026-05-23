import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GoogleLoginDto, RefreshTokenDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Đăng nhập / Đăng ký bằng Google ID Token
   * Có hỗ trợ bypass để test ở môi trường local/dev
   */
  async loginWithGoogle(dto: GoogleLoginDto) {
    let email: string;
    let name: string;
    let avatar: string | undefined;
    let googleId: string | undefined;

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    const isProduction = process.env.NODE_ENV === 'production';

    // Chỉ cho phép bypass Google OAuth ở môi trường phát triển (development/test) khi chưa cấu hình clientId hoặc có request bypassEmail
    if (!isProduction && (!clientId || dto.bypassEmail)) {
      this.logger.warn(`Bypassing Google OAuth. Authenticating user with email: ${dto.bypassEmail || 'mock-user@caycanhnamdinh.vn'}`);
      email = dto.bypassEmail || 'khachhang@caycanhnamdinh.vn';
      name = dto.bypassName || 'Khách hàng Nghệ Nhân Cây Cảnh Đỗ Xuân Hùng';
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
      googleId = 'mock_google_id_' + email.split('@')[0];
    } else {
      if (!clientId) {
        throw new BadRequestException('Google Client ID is not configured on production');
      }
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: dto.idToken,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.name) {
          throw new BadRequestException('Invalid Google ID Token payload');
        }
        email = payload.email;
        name = payload.name;
        avatar = payload.picture;
        googleId = payload.sub;
      } catch (error) {
        this.logger.error('Failed to verify Google ID Token:', error);
        throw new UnauthorizedException('Invalid Google credentials');
      }
    }

    // Tìm hoặc tạo người dùng mới
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar,
          googleId,
          role: 'user', // Default role
        },
      });
      this.logger.log(`Created new user: ${email} (${user.id})`);
    } else {
      // Cập nhật thông tin avatar hoặc googleId nếu chưa có
      if (!user.googleId || user.avatar !== avatar) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleId,
            avatar: avatar || user.avatar,
          },
        });
      }
    }

    return this.generateAuthTokens(user.id, user.email, user.role);
  }

  /**
   * Tạo Access Token & Refresh Token mới, lưu Refresh Token vào Redis
   */
  private async generateAuthTokens(userId: string, email: string, role: string) {
    const tokenId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      tokenId,
    };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: jwtPayload.sub, email: jwtPayload.email, role: jwtPayload.role },
        { secret: accessSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        jwtPayload,
        { secret: refreshSecret, expiresIn: '7d' },
      ),
    ]);

    // Lưu Refresh Token tokenId vào Redis với TTL là 7 ngày (604800 giây)
    const redisKey = `refresh_token:${userId}:${tokenId}`;
    await this.redisService.set(redisKey, 'true', 604800);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        name: (await this.prisma.user.findUnique({ where: { id: userId } }))?.name || '',
        avatar: (await this.prisma.user.findUnique({ where: { id: userId } }))?.avatar || null,
        role,
      },
    };
  }

  /**
   * Sử dụng Refresh Token để đổi lấy cặp Access/Refresh Token mới
   */
  async refreshTokens(dto: RefreshTokenDto) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sub: userId, tokenId, email, role } = payload;
    if (!userId || !tokenId) {
      throw new UnauthorizedException('Invalid refresh token structure');
    }

    // Kiểm tra token có tồn tại trong Redis không
    const redisKey = `refresh_token:${userId}:${tokenId}`;
    const tokenExists = await this.redisService.get(redisKey);
    if (!tokenExists) {
      throw new UnauthorizedException('Refresh token has been revoked or is invalid');
    }

    // Thu hồi (xóa) Refresh Token cũ
    await this.redisService.del(redisKey);

    // Sinh cặp token mới
    return this.generateAuthTokens(userId, email, role);
  }

  /**
   * Đăng xuất: Thu hồi Refresh Token hiện tại
   */
  async logout(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
      const redisKey = `refresh_token:${payload.sub}:${payload.tokenId}`;
      await this.redisService.del(redisKey);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Nếu token không hợp lệ hoặc đã hết hạn thì xem như đã logout
      return { success: true, message: 'Logged out' };
    }
  }

  /**
   * Đăng xuất trên toàn bộ thiết bị (thu hồi tất cả Refresh Tokens của user)
   */
  async logoutAll(userId: string) {
    await this.redisService.delByPrefix(`refresh_token:${userId}:`);
    return { success: true, message: 'Logged out of all sessions' };
  }

  async loginWithPassword(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return this.generateAuthTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: 'user',
      },
    });

    return this.generateAuthTokens(user.id, user.email, user.role);
  }
}
