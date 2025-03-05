import { ValidationError } from "class-validator";
import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { TradingStrategy } from "./trading-strategy";

export class TestStrategy extends TradingStrategy {
    constructor(strategy: Strategy) {
        super(strategy);
    }

    run(): Promise<MarketAction[]> {
        return new Promise((resolve) => {
            console.log(`Running test strategy ${this.strategy.name}`);
            resolve([new MarketAction(MarketActionEnum.SELL, 1, 2)]);
        });
    }

    validateConfig(config: any): ValidationError[] {
        throw new Error("Method not implemented.");
    }
}
