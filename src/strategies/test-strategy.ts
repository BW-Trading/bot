import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderSide, OrderType } from "../entities/order.entity";
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
        const signal: TradeSignal = {
            action: OrderSide.BUY,
            type: OrderType.LIMIT,
            asset: TradeableAssetEnum.BTCUSDT,
            price: 1,
            quantity: 1,
            justification: "Test signal",
            metadata: {
                test: "test",
                test2: "test2",
            },
        };

        return [signal];
    }
}
