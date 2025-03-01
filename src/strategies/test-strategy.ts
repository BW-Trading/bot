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
            resolve([
                new MarketAction(MarketActionEnum.BUY, 10, 1),
                new MarketAction(MarketActionEnum.SELL, 15, 1),
            ]);
        });
    }
}
