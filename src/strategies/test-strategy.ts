import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { StrategiesEnum } from "./strategies";
import { TradingStrategy } from "./trading-strategy";

export class TestStrategy extends TradingStrategy {
    constructor(
        strategyId: number,
        name: string,
        config: any,
        interval: number
    ) {
        super(strategyId, name, StrategiesEnum.TEST, config, interval);
    }

    run(): Promise<MarketAction[]> {
        return new Promise((resolve) => {
            console.log("Running test strategy");
            resolve([
                new MarketAction(MarketActionEnum.BUY, 100.123, 1, "BTC"),
                new MarketAction(MarketActionEnum.SELL, 100.124, 1, "BTC"),
            ]);
        });
    }
}
