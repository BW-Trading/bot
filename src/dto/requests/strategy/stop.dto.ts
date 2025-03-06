import { IsNumberString } from "class-validator";

export class StopStrategyDto {
    @IsNumberString()
    id!: number;
}
