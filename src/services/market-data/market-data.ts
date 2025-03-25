import { Order } from "../../entities/order.entity";

export abstract class MarketDataService {
    abstract availableMarketData: string[];

    hasMarketData(marketData: string): boolean {
        return this.availableMarketData.includes(marketData);
    }

    abstract retrieveMarketData(requiredMarketData: string[]): Promise<any>;

    abstract placeOrder(order: Order): Promise<any>;
    abstract cancelOrder(order: Order): Promise<any>;
    abstract getOrderStatus(order: Order): Promise<any>;
}
