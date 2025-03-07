import { IsNumberString } from "class-validator";
import { DTO } from "../../dto";

export class GetStrategyByIdPortfolioDto extends DTO {
    @IsNumberString()
    id!: number;
}
