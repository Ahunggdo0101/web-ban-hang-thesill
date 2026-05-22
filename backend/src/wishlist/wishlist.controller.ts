import { Controller, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm yêu thích của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách yêu thích thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async getWishlist(@GetUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm sản phẩm vào danh sách yêu thích' })
  @ApiResponse({ status: 201, description: 'Thêm sản phẩm vào danh sách yêu thích thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  @HttpCode(HttpStatus.CREATED)
  async addToWishlist(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi danh sách yêu thích' })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm khỏi danh sách yêu thích thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm yêu thích.' })
  @HttpCode(HttpStatus.OK)
  async removeFromWishlist(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }
}
