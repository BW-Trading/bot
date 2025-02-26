import { IsNumberString } from "class-validator";
import { DTO } from "../../dto";

export class GetStrategyOrdersDto extends DTO {
    @IsNumberString()
    id!: number;
}
