import { IsNumber, IsString } from "class-validator";

export class CreateCarDto {
    @IsString()
    name: String;
    @IsNumber()
    year: Number;
    @IsString()
    color: String;

}
