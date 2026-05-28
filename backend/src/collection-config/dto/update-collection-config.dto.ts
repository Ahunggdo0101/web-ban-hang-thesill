import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCollectionConfigDto {
  @ApiProperty({
    description: 'Danh sách các Product ID cho từng slot hiển thị (hoặc null cho lỗ trống)',
    type: [String],
    example: ['snake-plant-laurentii', null, 'monstera-deliciosa'],
  })
  @IsArray()
  slots: (string | null)[];

  @ApiProperty({
    description: 'Cấu hình section trending ở dưới phân trang',
    required: false,
  })
  @IsOptional()
  trending?: any;
}
