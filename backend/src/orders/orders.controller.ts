import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GetUser, RequestUser } from '../auth/decorators/get-user.decorator';
import { Post } from '@nestjs/common';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process checkout (Supports both registered users and guest checkouts)' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid cart or product details.' })
  async checkout(
    @Body() dto: CheckoutDto,
    @GetUser() user: RequestUser | null,
  ) {
    const userId = user ? user.id : undefined;
    return this.ordersService.checkout(dto, userId);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history of the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of user orders.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyOrders(@GetUser('id') userId: string) {
    return this.ordersService.findAllByUser(userId);
  }

  // ─── Admin-only endpoints ───────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all orders with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'All orders returned.' })
  async adminGetAllOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAllAdmin({
      page: Number(page),
      limit: Number(limit),
      status,
      search,
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get revenue and order statistics' })
  async adminGetStats() {
    return this.ordersService.getAdminStats();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete an order' })
  @ApiResponse({ status: 200, description: 'Order deleted.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async adminDeleteOrder(@Param('id') id: string) {
    return this.ordersService.removeOrder(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific order details for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Order details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrderDetails(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.findOne(id, userId);
  }
}
