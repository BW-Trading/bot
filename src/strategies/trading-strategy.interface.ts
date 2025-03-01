import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";

export interface ITradingStrategy {
    strategy: Strategy;
    isRunning: boolean;
    run(): Promise<MarketAction[]>;
    start(): void;
    stop(): void;
    getRunning(): boolean;
}
