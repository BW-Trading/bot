import { IsNumber } from "class-validator";

export class AddBalanceStrategyDto {
    @IsNumber()
    id!: number;

    @IsNumber()
    amount!: number;
}
