import { Order } from "../../entities/order.entity";
import {
    MarketData,
    MarketDataService,
    PlaceOrderResponse,
    PlaceOrderStatus,
    TradingOrderStatus,
} from "./market-data";

class TestMarketDataService extends MarketDataService {
    exchangeName: string = "testExchange";
    availableMarketData: MarketData[] = [
        MarketData.TICKER_PRICE,
        MarketData.LAST_5_TICKER_PRICES,
    ];

    getOrder(order: Order): Promise<TradingOrderStatus> {
        throw new Error("Method not implemented.");
    }

    getMarketData(marketData: MarketData): Promise<any> {
        switch (marketData) {
            case MarketData.TICKER_PRICE:
                return Promise.resolve(100);
            case MarketData.LAST_5_TICKER_PRICES:
                return Promise.resolve([100, 101, 102, 103, 104]);
            default:
                return Promise.reject({ message: "Market data not available" });
        }
    }

    placeOrder(order: Order): Promise<PlaceOrderResponse> {
        // Use the order to place an order on the test exchange
        // ...

        // Return the response
        return Promise.resolve({
            status: PlaceOrderStatus.SUCCESS,
            code: "000000",
            data: {
                timestamp: new Date(),
                orderId: Math.random().toString(),
                fee: 1,
            },
            errorMessage: "",
        });
    }

    cancelOrder(order: Order): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export const testMarketDataService = new TestMarketDataService();
