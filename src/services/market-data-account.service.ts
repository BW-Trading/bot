import { MarketDataAccount } from "../entities/market-data-account.entity";
import { NotFoundError } from "../errors/not-found-error";
import DatabaseManager from "./database-manager.service";

class MarketDataAccountService {
    marketDataAccountRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(
            MarketDataAccount
        );

    async getmarketDataAccountForStrategyOrThrow(strategyId: number) {
        const marketDataAccount =
            await this.marketDataAccountRepository.findOne({
                where: {
                    strategies: { id: strategyId },
                },
            });

        if (!marketDataAccount) {
            throw new NotFoundError(
                "MarketDataAccount",
                `Market data account not found for strategy with id ${strategyId}`,
                "id"
            );
        }

        return marketDataAccount;
    }
}

export const marketDataAccountService = new MarketDataAccountService();
