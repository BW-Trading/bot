import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { StrategiesEnum } from "./strategies";
import { ITradingStrategy } from "./trading-strategy.interface";

export abstract class TradingStrategy implements ITradingStrategy {
    name: string;
    strategy: StrategiesEnum;
    config: any;
    interval: number;

    constructor(
        name: string,
        strategy: StrategiesEnum,
        config: any,
        interval: number
    ) {
        this.name = name;
        this.strategy = strategy;
        this.config = config;
        this.interval = interval;
    }

    abstract run(): Promise<MarketActionEnum>;
}
