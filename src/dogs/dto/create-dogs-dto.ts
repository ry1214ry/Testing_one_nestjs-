import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDogsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsString()
  sound: string;
}
