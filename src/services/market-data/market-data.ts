import { Order } from "../../entities/order.entity";

export enum PlaceOrderStatus {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL",
}

export interface PlaceOrderResponse {
    status: PlaceOrderStatus;
    code: string;
    data: {
        timestamp: Date;
        orderId: string;
        fee: number;
    };
    errorMessage: string;
}

export abstract class MarketDataService {
    abstract availableMarketData: string[];

    /**
     * Returns true if the given marketData string label is available
     */
    hasMarketData(marketData: string): boolean {
        return this.availableMarketData.includes(marketData);
    }

    /**
     * Returns an object with the market data associated to the given list of marketData string labels
     */
    retrieveMarketData(requiredMarketData: string[]): Promise<any> {
        const marketData: { [key: string]: any } = {};

        for (const data of requiredMarketData) {
            if (!this.hasMarketData(data)) {
                throw new Error(`Market data ${data} is not available`);
            }

            marketData[data] = this.getMarketData(data);
        }

        return Promise.resolve(marketData);
    }

    /**
     * Returns the market data associated to the given marketData string label
     */
    abstract getMarketData(marketData: string): Promise<any>;

    abstract placeOrder(order: Order): Promise<PlaceOrderResponse>;
    abstract cancelOrder(order: Order): Promise<any>;
    abstract getOrderStatus(order: Order): Promise<any>;
}
