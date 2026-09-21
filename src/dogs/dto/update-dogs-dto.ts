import { IsNumber, IsString } from 'class-validator';

export class UpdateDogsDto {

  @IsString()
  name?: string;


  @IsNumber()
  age?: number;


  @IsString()
  sound?: string;
}


