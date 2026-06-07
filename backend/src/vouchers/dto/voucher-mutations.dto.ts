import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, IsIn, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher code', example: 'WELCOME10' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Voucher type', enum: ['product', 'shipping'], example: 'product' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['product', 'shipping'])
  type: string;

  @ApiProperty({ description: 'Discount calculation type', enum: ['percentage', 'fixed'], example: 'percentage' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['percentage', 'fixed'])
  discountType: string;

  @ApiProperty({ description: 'Discount value (e.g. 10 for percentage, 50000 for fixed)', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount for percentage type', example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Minimum order value required to apply', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number = 0;

  @ApiPropertyOptional({ description: 'Product category limit (e.g. plants)', example: 'plants' })
  @IsOptional()
  @IsString()
  categoryLimit?: string;

  @ApiPropertyOptional({ description: 'Start date of validity', example: '2026-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Expiry date of validity', example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Maximum usage limit for the voucher', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Is the voucher public for everyone', example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiPropertyOptional({ description: 'Target user ID for personal vouchers', example: 'user-uuid' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ description: 'Voucher code', example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Voucher type', enum: ['product', 'shipping'], example: 'product' })
  @IsOptional()
  @IsString()
  @IsIn(['product', 'shipping'])
  type?: string;

  @ApiPropertyOptional({ description: 'Discount calculation type', enum: ['percentage', 'fixed'], example: 'percentage' })
  @IsOptional()
  @IsString()
  @IsIn(['percentage', 'fixed'])
  discountType?: string;

  @ApiPropertyOptional({ description: 'Discount value', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount', example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Minimum order value required to apply', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ description: 'Product category limit', example: 'plants' })
  @IsOptional()
  @IsString()
  categoryLimit?: string;

  @ApiPropertyOptional({ description: 'Start date of validity' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Expiry date of validity' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Maximum usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Is the voucher public for everyone' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Target user ID for personal vouchers' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CartItemInfo {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Item price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Item quantity' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Item size (e.g. medium)' })
  @IsOptional()
  @IsString()
  size?: string;
}

export class ApplyVoucherDto {
  @ApiProperty({ description: 'Voucher code to apply', example: 'WELCOME10' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Items currently in the cart', type: [CartItemInfo] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemInfo)
  items: CartItemInfo[];
}
