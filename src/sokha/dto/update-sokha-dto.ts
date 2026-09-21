import { IsNumber, IsString } from 'class-validator'; //  can use it you must use command for install
export class UpdateSokhaDto {
  @IsString()
  name?: string;
  @IsNumber()
  age?: number;
  @IsString()
  gender?: string;
}
