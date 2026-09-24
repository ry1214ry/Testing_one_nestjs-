import { IsNumber, IsString } from 'class-validator';
export class CreateCatDto {
  @IsString()  // this field is must be require
  name: string;
  @IsNumber()
  age: number;
  @IsString()
  sound: string;
}
