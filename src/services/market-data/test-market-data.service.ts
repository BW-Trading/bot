import { Order } from "../../entities/order.entity";
import {
    MarketDataService,
    PlaceOrderResponse,
    PlaceOrderStatus,
    TradingOrderStatus,
} from "./market-data";

class TestMarketDataService extends MarketDataService {
    availableMarketData: string[] = ["tickerPrice", "last5TickerPrices"];

    updateOrder(order: Order): Promise<TradingOrderStatus> {
        // Use the order to update the order on the test exchange
        // Return the response
    }
    getMarketData(marketData: string): Promise<any> {
        switch (marketData) {
            case "tickerPrice":
                return Promise.resolve(100);
            case "last5TickerPrices":
                return Promise.resolve([100, 101, 102, 103, 104]);
            default:
                return Promise.reject("Market data not available");
        }
    }

    placeOrder(order: Order): Promise<PlaceOrderResponse> {
        // Use the order to place an order on the test exchange
        // ...

        // Return the response
        return Promise.resolve({
            status: PlaceOrderStatus.SUCCESS,
            code: "SUCCESS",
            data: {
                timestamp: new Date(),
                orderId: Math.random().toString(),
                fee: 1,
            },
            errorMessage: "",
        } as PlaceOrderResponse);
    }

    cancelOrder(order: Order): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getOrderStatus(order: Order): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export const testMarketDataService = new TestMarketDataService();
