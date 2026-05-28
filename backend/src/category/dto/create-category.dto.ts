import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category ID/Slug', example: 'indoor-plants' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Category Name', example: 'Cây trong nhà' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Category Description', example: 'Các loại cây trồng trong phòng kín...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category Image URL', example: 'https://images.unsplash.com/...', required: false })
  @IsString()
  @IsOptional()
  image?: string;
}
