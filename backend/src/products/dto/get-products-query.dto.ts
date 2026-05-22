import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category (e.g. plants, pots, care)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by light requirements (low, medium, bright)' })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'bright'])
  light?: string;

  @ApiPropertyOptional({ description: 'Filter pet friendly plants' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by care difficulty (easy, moderate, care)' })
  @IsOptional()
  @IsString()
  @IsIn(['easy', 'moderate', 'care'])
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Filter by size (small, medium, large)' })
  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  size?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Search query for product name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  @IsIn(['price_asc', 'price_desc', 'rating_desc', 'newest'])
  sortBy?: string = 'newest';

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 12 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 12;
}
