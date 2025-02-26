import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { StrategiesEnum } from "./strategies";
import { TradingStrategy } from "./trading-strategy";

export class TestStrategy extends TradingStrategy {
    constructor(name: string, config: any, interval: number) {
        super(name, StrategiesEnum.TEST, config, interval);
    }

    run(): Promise<MarketActionEnum> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("Test strategy executed");
                resolve(MarketActionEnum.BUY);
            }, 5000);
        });
    }
}
