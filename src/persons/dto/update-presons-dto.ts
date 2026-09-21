import {IsEmail,IsNotEmpty,IsNumber,IsOptional,IsString,} from 'class-validator';
export class UpdatePersonsDto {
  //  i  ahve requier all fields
  @IsNotEmpty()  // This field is required
  @IsString()
  name: string;

  @IsNotEmpty() // This field is required
  @IsNumber()
  age: number;

  @IsNotEmpty() // This field is required
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional() // Set to @IsNotEmpty() if phone is mandatory
  @IsNumber()
  phone: number;
}
