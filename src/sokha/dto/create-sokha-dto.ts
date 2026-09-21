import { IsNumber, IsString } from 'class-validator';

export class CreateSokhaDto {
  @IsString()   // this field is must be require 
  name: string;
  @IsNumber()
  age: number;
  @IsString()
  gender: string;
}
