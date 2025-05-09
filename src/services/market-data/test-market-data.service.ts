import { Order, OrderStatus } from "../../entities/order.entity";
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

    getOrderStatus(order: Order): Promise<TradingOrderStatus> {
        // Simulate order status retrieval

        const filledOrder: TradingOrderStatus = {
            platform: "Test",
            orderId: "",
            clientOrderId: order.id.toString(),
            symbol: order.asset, // Ex: BTCUSDT, ETHUSDT, ...
            price: order.price, // Prix limite (0 si MARKET)
            quantity: order.quantity, // Quantité d'actifs
            executedQuantity: order.quantity, // Quantité exécutée
            totalValue: order.quantity * order.price, // Montant total exécuté (prix * qty exécutée)
            status: OrderStatus.FILLED,
            orderType: order.type,
            side: order.side,
            createdAt: Date.now(), // Timestamp de création
            updatedAt: Date.now(), // Timestamp de mise à jour
            extra: undefined, // Infos supplémentaires spécifiques à la plateforme
        };

        // Simulate a delay to mimic network request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(filledOrder);
            }, 1000);
        });
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
                orderId: (Math.random() * 100000000).toFixed(8).toString(),
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
