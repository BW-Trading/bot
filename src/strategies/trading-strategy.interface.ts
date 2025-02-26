import { MarketAction } from "../entities/market-action.entity";
import { StrategiesEnum } from "./strategies";

export interface ITradingStrategy {
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;
    run(): Promise<MarketAction[]>;
}
