import { IsEnum, IsNumber, IsObject, IsString } from "class-validator";
import { DTO } from "../../dto";
import { TradeableAssetEnum } from "../../../entities/enums/tradeable-asset.enum";
import { StrategyInstanceEnum } from "../../../entities/enums/strategies.enum";

export class CreateStrategyDto extends DTO {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsEnum(TradeableAssetEnum)
    asset!: TradeableAssetEnum;

    @IsEnum(StrategyInstanceEnum)
    strategyType!: StrategyInstanceEnum;

    @IsObject({ message: "Data must be a valid JSON object" })
    config!: any;

    @IsString()
    interval!: string;

    @IsNumber()
    marketDataAccountId!: number;
}
