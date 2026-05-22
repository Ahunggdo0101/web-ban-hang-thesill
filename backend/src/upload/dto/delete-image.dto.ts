import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    description: 'URL của ảnh cần xóa trên Cloudinary',
    example: 'https://res.cloudinary.com/dpk0jxpg7/image/upload/v1779354221/the_sill_products/monstera.png'
  })
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
