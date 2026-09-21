import { IsNumber, IsString } from 'class-validator';

export class CreateDogsDto {

  @IsString()
  name: string;


  @IsNumber()
  age: number;


  @IsString()
  sound: string;
}
