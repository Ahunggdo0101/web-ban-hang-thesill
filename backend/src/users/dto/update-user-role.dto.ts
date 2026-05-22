import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['user', 'admin'] })
  @IsNotEmpty()
  @IsString()
  role: string;
}
