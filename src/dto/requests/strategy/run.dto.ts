import { IsNumberString, IsString } from "class-validator";
import { DTO } from "../../dto";

export class RunStrategyDto extends DTO {
    @IsNumberString()
    id!: number;

    @IsString()
    symbol!: string;
}
