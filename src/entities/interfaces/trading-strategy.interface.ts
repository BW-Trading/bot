import { StrategiesEnum } from "../../strategies/strategies";
import { MarketActionEnum } from "../enums/market-action.enum";

export interface ITradingStrategy {
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;
    run(data?: any): Promise<MarketActionEnum>;
}
