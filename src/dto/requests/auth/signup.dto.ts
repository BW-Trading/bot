import { IsString } from "class-validator";
import { DTO } from "../../dto";

export class SignupDto extends DTO {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}
