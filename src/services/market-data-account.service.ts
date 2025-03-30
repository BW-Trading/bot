import { getConnection } from "typeorm";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import { getContextUserId } from "../entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import DatabaseManager from "./database-manager.service";
import { ExchangeApiEnum } from "./market-data/exchange-api.enum";
import { walletService } from "./wallet.service";

class MarketDataAccountService {
    marketDataAccountRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(
            MarketDataAccount
        );

    /**
     * Créé un market data account pour l'utilisateur connecté pour l'échange donné et l'apiKey donnée
     * On utilise une transaction pour s'assurer que le market data account et le wallet sont créés en même temps et ainsi qu'on ne créé pas de Wallet orphelin
     */
    async createMarketDataAccount(exchange: ExchangeApiEnum, apiKey: string) {
        if (await this.existsByApiKey(apiKey)) {
            throw new AlreadyExistsError(
                `Market data account with the same API key already exists`,
                { apiKey }
            );
        }

        const queryRunner =
            DatabaseManager.getInstance().appDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const wallet = walletService.createWallet();
            await queryRunner.manager.save(wallet);

            const marketDataAccount = new MarketDataAccount();
            marketDataAccount.user = { id: getContextUserId() } as any;
            marketDataAccount.exchangeApi = exchange;
            marketDataAccount.apiKey = apiKey;
            marketDataAccount.wallet = wallet;

            await queryRunner.manager.save(marketDataAccount);

            await queryRunner.commitTransaction();
            return marketDataAccount;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

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

    async existsByApiKey(apiKey: string) {
        const marketDataAccount =
            await this.marketDataAccountRepository.findOne({
                where: {
                    user: { id: getContextUserId() },
                    apiKey,
                },
            });

        return !!marketDataAccount;
    }

    async getMarketDataAccounts() {
        const marketDataAccounts = await this.marketDataAccountRepository.find({
            where: {
                user: { id: getContextUserId() },
            },
        });

        return marketDataAccounts;
    }
}

export const marketDataAccountService = new MarketDataAccountService();
