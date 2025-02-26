import { MarketAction } from "../entities/market-action.entity";
import { StrategiesEnum } from "./strategies";

export interface ITradingStrategy {
    strategyId: number; // This is the ID of the strategy in the database
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;
    run(): Promise<MarketAction[]>;
}
