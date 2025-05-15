import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderType } from "../entities/order.entity";
import { MarketData, OrderSide } from "../services/market-data/market-data";
import { TradeSignal } from "./trade-signal";
import { TradingStrategy } from "./trading-strategy";

export class TestTradingStrategy extends TradingStrategy {
    public simulateStrategy(
        historicalData: any[],
        balance: number,
        config: any
    ): { finalBalance: number; remainingPosition: number } {
        let position = 0;
        const { buyThreshold, sellThreshold } = config;

        for (const dataPoint of historicalData) {
            const price = dataPoint.tickerPrice;

            if (price < buyThreshold && balance > 0) {
                const quantityToBuy = balance / price;
                position += quantityToBuy;
                balance -= quantityToBuy * price;
            } else if (price > sellThreshold && position > 0) {
                balance += position * price;
                position = 0;
            }
        }

        const remainingPositionValue =
            position *
            (historicalData[historicalData.length - 1]?.tickerPrice || 0);

        return {
            finalBalance: balance + remainingPositionValue,
            remainingPosition: position,
        };
    }
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
        const signal: TradeSignal = {
            action: OrderSide.SELL,
            type: OrderType.LIMIT,
            asset: TradeableAssetEnum.BTCUSDT,
            price: 2,
            quantity: 6,
            justification: "Test signal",
            metadata: {
                test: "test",
                test2: "test2",
            },
        };

        return [signal];
    }
}
