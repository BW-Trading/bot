import { IsDate, IsNumberString } from "class-validator";

export class SimulationRequestDto {
    @IsDate()
    startDate!: Date;

    @IsDate()
    endDate!: Date;

    @IsNumberString()
    balance!: number;

    @IsNumberString()
    strategyId!: number;

    @IsNumberString()
    symbol!: string;
}
