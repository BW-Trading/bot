import { IsString } from "class-validator";
import { DTO } from "../../dto";

export class LoginDto extends DTO {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}
