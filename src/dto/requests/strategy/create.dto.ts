import {
    IsEnum,
    IsJSON,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { DTO } from "../../dto";
import { StrategiesEnum } from "../../../strategies/strategies";
import { TradeableAssetEnum } from "../../../entities/enums/tradeable-asset.enum";

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

    @IsEnum(TradeableAssetEnum)
    asset!: TradeableAssetEnum;

    @IsOptional()
    @IsNumber()
    balance?: number;
}
