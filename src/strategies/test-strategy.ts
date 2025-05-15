import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderType } from "../entities/order.entity";
import { MarketData, OrderSide } from "../services/market-data/market-data";
import { TradeSignal } from "./trade-signal";
import { TradingStrategy } from "./trading-strategy";

export class TestTradingStrategy extends TradingStrategy {
    // Perhaps can use analyze method
    public simulateStrategy(
        historicalData: any[],
        balance: number,
        config: any
    ): { finalBalance: number; remainingPosition: number } {
        let position = 0;
        const { buyThreshold, sellThreshold } = config;

        const tickerPrice = historicalData[0];
        const last5TickerPrices = historicalData[1];

        const averagePrice =
            (last5TickerPrices[0] +
                last5TickerPrices[1] +
                last5TickerPrices[2] +
                last5TickerPrices[3] +
                last5TickerPrices[4]) /
            5;

        if (averagePrice < buyThreshold && balance > 0) {
            const quantityToBuy = balance / tickerPrice;
            position += quantityToBuy;
            balance -= quantityToBuy * tickerPrice;
        } else if (tickerPrice > sellThreshold && position > 0) {
            balance += position * tickerPrice;
            position = 0;
        }

        const remainingPositionValue = position * tickerPrice;

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
