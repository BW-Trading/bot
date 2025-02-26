import { IsNumber, IsNumberString } from "class-validator";
import { DTO } from "../../dto";

export class RunStrategyDto extends DTO {
    @IsNumberString()
    id!: number;
}
