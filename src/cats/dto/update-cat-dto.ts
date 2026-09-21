import { IsNumber, IsString } from 'class-validator';
export class UpdateCatDto {
  //   @IsOptional()
  @IsString()
  name?: string;
  //   @IsOptional()   //  if i use the isoptional mean the filed is missing if okey
  @IsNumber()
  age?: number;
  //   @IsOptional()
  @IsString()
  sound?: string;
}
