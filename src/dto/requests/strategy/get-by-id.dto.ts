import { IsNumberString } from "class-validator";
import { DTO } from "../../dto";

export class GetStrategyByIdDto extends DTO {
    @IsNumberString()
    id!: number;
}
