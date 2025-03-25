import { Order } from "../../entities/order.entity";
import { NotFoundError } from "../../errors/not-found-error";
import { marketDataAccountService } from "../market-data-account.service";
import { BinanceMarketDataService } from "./binance-market-data.service";
import { ExchangeApiEnum } from "./exchange-api.enum";
import { MarketDataService } from "./market-data";

export class MarketDataManager {
    async retrieveMarketData(
        strategyId: number,
        requiredMarketData: string[]
    ): Promise<any> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );

        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );

        return marketDataService.retrieveMarketData(requiredMarketData);
    }

    async placeOrder(strategyId: number, order: Order): Promise<any> {
        const marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategyId
            );

        const marketDataService = this.getMarketDataService(
            marketDataAccount.exchangeApi
        );

        return marketDataService.placeOrder(order);
    }

    getMarketDataService(exchangeApi: ExchangeApiEnum): MarketDataService {
        switch (exchangeApi) {
            case ExchangeApiEnum.BINANCE:
                return new BinanceMarketDataService();
            default:
                throw new NotFoundError(
                    `ExchangeApiEnum`,
                    `Exchange API not found for ${exchangeApi}`
                );
        }
    }
}

export const marketDataManager = new MarketDataManager();
