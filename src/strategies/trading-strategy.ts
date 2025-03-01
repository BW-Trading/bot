import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { ITradingStrategy } from "./trading-strategy.interface";

export abstract class TradingStrategy implements ITradingStrategy {
    strategy: Strategy;
    isRunning: boolean;

    constructor(strategy: Strategy) {
        this.strategy = strategy;
        this.isRunning = false;
    }

    abstract run(): Promise<MarketAction[]>;

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    getRunning(): boolean {
        return this.isRunning;
    }
}
