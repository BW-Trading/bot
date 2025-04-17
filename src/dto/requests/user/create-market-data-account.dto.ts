import { IsEnum, IsString } from "class-validator";
import { DTO } from "../../dto";
import { ExchangeApiEnum } from "../../../services/market-data/exchange-api.enum";

export class CreateMarketDataAccountDto extends DTO {
    @IsString()
    apiKey!: string;

    @IsEnum(ExchangeApiEnum)
    exchange!: ExchangeApiEnum;
}
