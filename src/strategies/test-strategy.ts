import { TradeSignal } from "./trade-signal";
import { TradingStrategy } from "./trading-strategy";

export class TestTradingStrategy extends TradingStrategy {
    public getRequiredMarketData(): string[] {
        return ["testMarketData"];
    }
    public validateConfig(config: any) {
        return true;
    }
    public analyze(marketData: any): void {
        return;
    }
    public generateSignals(): TradeSignal[] {
        throw new Error("Method not implemented.");
    }
}
