import { NotFoundError } from "../../errors/not-found-error";
import { marketDataAccountService } from "../market-data-account.service";
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

        switch (marketDataAccount.exchangeApi) {
            case ExchangeApiEnum.BINANCE:
                return; // Return BinanceMarketDataService.getMarketData(requiredMarketData);
            default:
                throw new NotFoundError(
                    `ExchangeApiEnum`,
                    `Exchange API not found for strategy ${strategyId}`
                );
        }
    }

    getMarketDataService(exchangeApi: ExchangeApiEnum): MarketDataService {
        switch (exchangeApi) {
            case ExchangeApiEnum.BINANCE:
                return; // return BinanceMarketDataService;
            default:
                throw new NotFoundError(
                    `ExchangeApiEnum`,
                    `Exchange API not found for ${exchangeApi}`
                );
        }
    }
}

export const marketDataManager = new MarketDataManager();
