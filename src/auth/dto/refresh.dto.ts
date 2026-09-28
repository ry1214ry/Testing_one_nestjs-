import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Valid refresh token issued at login or during a previous refresh',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}