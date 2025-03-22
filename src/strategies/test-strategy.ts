import { ValidationError } from "class-validator";
import { Strategy } from "../entities/strategy.entity";
import { TradingStrategy } from "./trading-strategy";
import { StrategyResult } from "./trading-strategy.interface";
import { marketActionService } from "../services/market-action.service";

export class TestStrategy extends TradingStrategy {
    constructor(strategy: Strategy) {
        super(strategy);
    }

    async run(): Promise<StrategyResult> {
        console.log(`Running test strategy ${this.strategy.name}`);

        const marketActions = await this.getStrategyOpenMarketActions();

        let result;
        if (!marketActions || marketActions.length === 0) {
            result = {
                marketActions: [
                    await marketActionService.create(this.strategy, 1, 10000),
                ],
                currentPrice: 10000,
            };
        } else {
            const marketAction = marketActions[0];
            marketAction.toClose(11000);

            result = {
                marketActions: [marketAction],
                currentPrice: 11000,
            };
        }

        return result;
    }

    validateConfig(config: any): ValidationError[] {
        return [];
    }
}
