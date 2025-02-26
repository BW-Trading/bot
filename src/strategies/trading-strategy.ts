import { MarketAction } from "../entities/market-action.entity";
import { StrategiesEnum } from "./strategies";
import { ITradingStrategy } from "./trading-strategy.interface";

export abstract class TradingStrategy implements ITradingStrategy {
    strategyId: number;
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;

    constructor(
        strategyId: number,
        name: string,
        strategy: StrategiesEnum,
        config: any,
        interval: number
    ) {
        this.strategyId = strategyId;
        this.name = name;
        this.strategy = strategy;
        this.config = config;
        this.interval = interval;
    }

    abstract run(): Promise<MarketAction[]>;
}
