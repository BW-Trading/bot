import { IsNumberString } from "class-validator";

export class GetStrategyExecutionDto {
    @IsNumberString()
    id!: number;
}
