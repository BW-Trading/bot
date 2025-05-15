import { Order, OrderStatus, OrderType } from "../../entities/order.entity";

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

export interface CancelOrderResponse {
    status: PlaceOrderStatus;
    code: string;
    data: {
        timestamp: Date;
        orderId: string;
    };
    errorMessage: string;
}

export enum OrderSide {
    BUY = "BUY",
    SELL = "SELL",
}

export interface TradingOrderStatus {
    platform: string; // Ex: "binance", "kraken", ...
    orderId: string | number;
    clientOrderId?: string; // ID clientside (optionnel)
    symbol: string; // Ex: BTCUSDT, ETHUSDT, ...
    price: number; // Prix limite (0 si MARKET)
    quantity: number; // Quantité d'actifs
    executedQuantity: number; // Quantité exécutée
    totalValue: number; // Montant total exécuté (prix * qty exécutée)
    status: OrderStatus;
    orderType: OrderType;
    side: OrderSide;
    createdAt: number; // Timestamp de création
    updatedAt: number; // Timestamp de mise à jour
    extra?: Record<string, any>; // Infos supplémentaires spécifiques à la plateforme
}

export enum MarketData {
    TICKER_PRICE = "tickerPrice",
    LAST_5_TICKER_PRICES = "last5TickerPrices",
    ORDER_BOOK = "orderBook",
    CANDLESTICK_DATA = "candlestickData",
    TRADE_HISTORY = "tradeHistory",
}

export abstract class MarketDataService {
    abstract availableMarketData: MarketData[];
    abstract exchangeName: string;

    /**
     * Returns true if the given marketData string label is available
     */
    hasMarketData(marketData: MarketData): boolean {
        return this.availableMarketData.includes(marketData);
    }

    /**
     * Returns an object with the market data associated to the given list of marketData string labels
     */
    retrieveMarketData(
        requiredMarketData: MarketData[],
        symbol: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<any> {
        const marketData: { [key: string]: any } = {};

        for (const data of requiredMarketData) {
            if (!this.hasMarketData(data)) {
                throw new Error(`Market data ${data} is not available `);
            }

            marketData[data] = this.getMarketData(
                data,
                symbol,
                startDate,
                endDate
            );
        }

        return Promise.resolve(marketData);
    }

    /**
     * Returns the market data associated to the given marketData string label
     */
    abstract getMarketData(
        marketData: string,
        symbol: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<any>;

    abstract placeOrder(order: Order): Promise<PlaceOrderResponse>;
    abstract cancelOrder(order: Order): Promise<any>;
    abstract getOrderStatus(order: Order): Promise<TradingOrderStatus>;
}
