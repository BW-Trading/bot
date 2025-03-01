import { IsNumberString } from "class-validator";

export class RunStrategyOnceDto {
    @IsNumberString()
    id!: number;
}
