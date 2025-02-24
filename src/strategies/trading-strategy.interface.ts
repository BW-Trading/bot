import { StrategiesEnum } from "./strategies";
import { MarketActionEnum } from "../entities/enums/market-action.enum";

export interface ITradingStrategy {
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;
    run(): Promise<MarketActionEnum>;
}
