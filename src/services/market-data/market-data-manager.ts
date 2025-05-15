import { Order, OrderStatus } from "../../entities/order.entity";
import { NotFoundError } from "../../errors/not-found-error";
import { marketDataAccountService } from "../market-data-account.service";
import { ExchangeApiEnum } from "./exchange-api.enum";
import {
    MarketData,
    MarketDataService,
    PlaceOrderResponse,
    TradingOrderStatus,
} from "./market-data";
import { testMarketDataService } from "./test-market-data.service";

export class MarketDataManager {
    async retrieveMarketData(
        strategyId: number,
        requiredMarketData: MarketData[],
        symbol: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<any> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );

        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );

        return marketDataService.retrieveMarketData(
            requiredMarketData,
            symbol,
            startDate,
            endDate
        );
    }

    async placeOrder(
        strategyId: number,
        order: Order
    ): Promise<PlaceOrderResponse> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );

        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );

        return await marketDataService.placeOrder(order);
    }

    async cancelOrder(strategyId: number, order: Order): Promise<any> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );

        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );

        return await marketDataService.cancelOrder(order);
    }

    async getOrderStatus(
        strategyId: number,
        order: Order
    ): Promise<TradingOrderStatus> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );
        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );
        return await marketDataService.getOrderStatus(order);
    }

    getMarketDataService(exchangeApi: ExchangeApiEnum): MarketDataService {
        switch (exchangeApi) {
            case ExchangeApiEnum.TEST:
                return testMarketDataService;
            // case ExchangeApiEnum.BINANCE:
            //     return binanceMarketDataService;
            default:
                throw new NotFoundError(
                    `ExchangeApiEnum`,
                    `Exchange API not found for ${exchangeApi}`
                );
        }
    }
}

export const marketDataManager = new MarketDataManager();
