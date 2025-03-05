import {
    IsEnum,
    IsJSON,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";
import { DTO } from "../../dto";
import { StrategiesEnum } from "../../../entities/enums/strategies.enum";
import { TradeableAssetEnum } from "../../../entities/enums/tradeable-asset.enum";

export class CreateStrategyDto extends DTO {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsEnum(StrategiesEnum)
    strategyEnum!: StrategiesEnum;

    @IsObject({ message: "Data must be a valid JSON object" })
    config!: any;

    @IsNumber()
    interval!: number;

    @IsEnum(TradeableAssetEnum)
    asset!: TradeableAssetEnum;

    @IsOptional()
    @IsNumber()
    balance?: number;
}
