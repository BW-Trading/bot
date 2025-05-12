import { MarketDataController } from "../controllers/market-data.controller";
import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderType } from "../entities/order.entity";
import { MarketData, OrderSide } from "../services/market-data/market-data";
import { TradeSignal } from "./trade-signal";
import { TradingStrategy } from "./trading-strategy";

export class TestTradingStrategy extends TradingStrategy {
    public getRequiredMarketData(): MarketData[] {
        return [MarketData.TICKER_PRICE, MarketData.LAST_5_TICKER_PRICES];
    }
    public validateConfig(config: any) {
        return true;
    }
    public analyze(marketData: any): void {
        return;
    }
    public generateSignals(): TradeSignal[] {
        const signalBuy: TradeSignal = {
            action: OrderSide.BUY,
            type: OrderType.LIMIT,
            asset: TradeableAssetEnum.BTCUSDT,
            price: 2,
            quantity: 5,
            justification: "Test signal",
            metadata: {
                test: "test",
                test2: "test2",
            },
        };

        const signalSell: TradeSignal = {
            action: OrderSide.SELL,
            type: OrderType.LIMIT,
            asset: TradeableAssetEnum.BTCUSDT,
            price: 3,
            quantity: 5,
            justification: "Test signal",
            metadata: {
                test: "test",
                test2: "test2",
            },
        }

        return [signalBuy, signalSell];
    }
}
