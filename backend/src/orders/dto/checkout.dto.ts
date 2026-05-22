import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: 'ID of the product being purchased', example: 'snake-plant-laurentii' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'The chosen pot style', example: 'Classic' })
  @IsNotEmpty()
  @IsString()
  potStyle: string;

  @ApiProperty({ description: 'The chosen pot color', example: 'Cream' })
  @IsNotEmpty()
  @IsString()
  potColor: string;

  @ApiProperty({ description: 'Quantity purchased', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({ description: 'Full name of the customer', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Email address of the customer', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '0901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Detailed shipping address', example: '123 ABC Street' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'Shipping district', example: 'District 1' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ description: 'Shipping city/province', example: 'HCMC' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'List of products in the shopping cart', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Discount code amount applied', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number = 0;

  @ApiPropertyOptional({ description: 'Shipping cost calculated', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number = 0;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New order status', enum: ['pending', 'processing', 'completed', 'cancelled'] })
  @IsNotEmpty()
  @IsString()
  status: string;
}
