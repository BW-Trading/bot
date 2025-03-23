import { TradeSignal } from "./trade-signal";
import { TradingStrategy } from "./trading-strategy";

export class TestTradingStrategy extends TradingStrategy {
    public validateConfig(config: any) {
        throw new Error("Method not implemented.");
    }
    public analyze(marketData: any): void {
        throw new Error("Method not implemented.");
    }
    public generateSignals(): TradeSignal[] {
        throw new Error("Method not implemented.");
    }
}
