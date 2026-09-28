import { IsNumber, IsString } from 'class-validator';

export class CreatePeopleDto {
  @IsString()
  firstname: String;
  @IsString()
  lastname: String;
  @IsNumber()
  age: Number;
  @IsNumber()
  phone: Number;
}
