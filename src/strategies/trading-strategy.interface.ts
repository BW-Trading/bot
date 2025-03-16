import { ValidationError } from "class-validator";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";

export interface StrategyResult {
    marketActions: MarketAction[];
    currentPrice: number;
    error?: string;
}

export interface ITradingStrategy {
    strategy: Strategy;
    isRunning: boolean;
    run(): Promise<StrategyResult>;
    start(): void;
    stop(): void;
    getRunning(): boolean;
    validateConfig(config: any): ValidationError[];
}
