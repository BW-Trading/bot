import { ValidationError } from "class-validator";
import { Strategy } from "../entities/strategy.entity";
import { TradingStrategy } from "./trading-strategy";
import { StrategyResult } from "./trading-strategy.interface";
import { marketActionService } from "../services/market-action.service";
import { MarketActionEnum } from "../entities/enums/market-action.enum";

export class TestStrategy extends TradingStrategy {
    constructor(strategy: Strategy) {
        super(strategy);
    }

    async run(): Promise<StrategyResult> {
        console.log(`Running test strategy ${this.strategy.name}`);
        const marketActions = await this.getStrategyOpenMarketActions();

        if (!marketActions || marketActions.length === 0) {
            return {
                marketActions: [
                    await marketActionService.create(this.strategy, 1),
                ],
                currentPrice: 10000,
            };
        } else {
            const marketAction = marketActions[0];
            marketAction.action = MarketActionEnum.SELL;

            return {
                marketActions: [marketAction],
                currentPrice: 11000,
            };
        }
    }

    validateConfig(config: any): ValidationError[] {
        return [];
    }
}
