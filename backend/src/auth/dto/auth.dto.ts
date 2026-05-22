import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'The Google ID Token received from Google Auth on the client side',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFl...',
  })
  @IsNotEmpty()
  @IsString()
  idToken: string;

  // Dành cho môi trường test/development khi chưa cấu hình Google Client ID hoặc muốn bypass để chạy thử
  @ApiProperty({
    description: 'Bypass email for development/testing without real Google Auth setup',
    required: false,
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  bypassEmail?: string;

  @ApiProperty({
    description: 'Bypass name for development/testing',
    required: false,
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  bypassName?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The long-lived refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
