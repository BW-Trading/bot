import {
    IsEnum,
    IsJSON,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { DTO } from "../../dto";
import { StrategiesEnum } from "../../../strategies/strategies";

export class CreateStrategyDto extends DTO {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsEnum(StrategiesEnum)
    strategyEnum!: StrategiesEnum;

    @IsJSON()
    config!: any;

    @IsNumber()
    interval!: number;

    @IsString()
    asset!: string;

    @IsOptional()
    @IsNumber()
    balance?: number;
}
