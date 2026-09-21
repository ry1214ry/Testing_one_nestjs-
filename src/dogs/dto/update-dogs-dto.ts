import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDogsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  sound?: string;
}


