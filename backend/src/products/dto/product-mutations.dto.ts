import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsJSON, Min, Max, IsObject, ValidateNested, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class VariantDto {
  @ApiProperty({ description: 'Size type', example: 'medium', enum: ['small', 'medium', 'large', 'xlarge'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['small', 'medium', 'large', 'xlarge'])
  size: string;

  @ApiProperty({ description: 'Minimum height in cm', example: 30 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  heightMin: number;

  @ApiProperty({ description: 'Maximum height in cm', example: 60 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  heightMax: number;

  @ApiProperty({ description: 'Price for this size', example: 350000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Stock quantity', example: 10 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Unique slug / identifier for the product', example: 'snake-plant-laurentii' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Product display name', example: 'Snake Plant Laurentii' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Botanical scientific name', example: 'Sansevieria trifasciata' })
  @IsNotEmpty()
  @IsString()
  botanicalName: string;

  @ApiProperty({ description: 'Base price of the product', example: 38 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Full description of the product', example: 'The Snake Plant Laurentii is a succulent plant...' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product categories (plants, pots, care)', example: ['plants'] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ description: 'Main image URL', example: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ description: 'Gallery image URLs', example: ['url1', 'url2'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({ description: 'Map of pot colors to specific image URLs', example: { 'black': 'url1', 'white': 'url2' } })
  @IsOptional()
  @IsObject()
  colorImages?: Record<string, string>;

  @ApiProperty({ description: 'Light requirement (low, medium, bright)', example: 'low' })
  @IsNotEmpty()
  @IsString()
  light: string;

  @ApiPropertyOptional({ description: 'Is the plant pet friendly? (Deprecated - managed via Category instead)', example: false })
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiProperty({ description: 'Difficulty level (easy, moderate, care)', example: 'easy' })
  @IsNotEmpty()
  @IsString()
  difficulty: string;

  @ApiProperty({ description: 'Size (small, medium, large)', example: 'medium' })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiPropertyOptional({ description: 'Product rating', example: 4.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Number of product reviews', example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewsCount?: number;

  @ApiPropertyOptional({
    description: 'Detailed care tips',
    example: {
      light: 'Thrives in medium to bright indirect light.',
      water: 'Water every 2-3 weeks.',
      toxicity: 'Toxic to pets.'
    }
  })
  @IsOptional()
  @IsObject()
  careDetails?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Giới hạn số lượng mua tối đa trên mỗi đơn hàng', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPurchaseLimit?: number;

  @ApiPropertyOptional({ description: 'Product size variants with pricing and stock', type: [VariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Botanical scientific name' })
  @IsOptional()
  @IsString()
  botanicalName?: string;

  @ApiPropertyOptional({ description: 'Base price of the product' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Full description of the product' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Product categories', example: ['plants'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Main image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Gallery image URLs' })
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Map of pot colors to specific image URLs' })
  @IsOptional()
  @IsObject()
  colorImages?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Light requirement' })
  @IsOptional()
  @IsString()
  light?: string;

  @ApiPropertyOptional({ description: 'Is the plant pet friendly?' })
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({ description: 'Difficulty level' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Size' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ description: 'Product rating' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Number of product reviews' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewsCount?: number;

  @ApiPropertyOptional({ description: 'Detailed care tips' })
  @IsOptional()
  @IsObject()
  careDetails?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Giới hạn số lượng mua tối đa trên mỗi đơn hàng', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPurchaseLimit?: number;

  @ApiPropertyOptional({ description: 'Product size variants with pricing and stock', type: [VariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
