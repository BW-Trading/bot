import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { StrategiesEnum } from "./strategies";
import { TradingStrategy } from "./trading-strategy";

export class TestStrategy extends TradingStrategy {
    constructor(name: string) {
        super(name, StrategiesEnum.TEST, {}, 1000);
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
