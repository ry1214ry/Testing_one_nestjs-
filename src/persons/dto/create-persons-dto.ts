import {IsEmail,IsNotEmpty,IsNumber,IsOptional,IsString,} from 'class-validator';
export class CreatePersonsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional() // Set to @IsNotEmpty() if phone is mandatory
  @IsNumber()
  phone: number;
}
