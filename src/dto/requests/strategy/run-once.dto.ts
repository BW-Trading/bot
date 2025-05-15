import { IsNumberString, IsString } from "class-validator";

export class RunStrategyOnceDto {
    @IsNumberString()
    id!: number;
}
