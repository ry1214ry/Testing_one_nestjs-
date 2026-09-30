// src/dogs/dto/create-dog.dto.ts
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateDogDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsInt()
  age: number;
}
