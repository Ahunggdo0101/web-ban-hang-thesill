import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest để KHÔNG quăng lỗi khi không có token hoặc token không hợp lệ
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      return null; // Trả về null thay vì quăng lỗi Unauthorized
    }
    return user;
  }
}
