import { MarketDataAccount } from "../entities/market-data-account.entity";
import { getContextUserId } from "../entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import DatabaseManager from "./database-manager.service";
import { ExchangeApiEnum } from "./market-data/exchange-api.enum";
import { walletService } from "./wallet.service";

export class MarketDataAccountService {
    private getRepository() {
        const dataSource = DatabaseManager.getAppDataSource();
        if (!dataSource.isInitialized) {
            throw new Error("DataSource is not initialized yet");
        }
        return dataSource.getRepository(MarketDataAccount);
    }
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

    async getmarketDataAccountForStrategyOrThrow(
        strategyId: number,
        userId: string
    ) {
        let marketDataAccount: MarketDataAccount | null = null;

        try {
            const marketDataAccountRepository = this.getRepository();
            marketDataAccount = await marketDataAccountRepository
                .createQueryBuilder("account")
                .leftJoinAndSelect("account.strategies", "strategy")
                .leftJoinAndSelect("account.user", "user")
                .where("user.id = :userId", { userId })
                .andWhere("strategy.id = :strategyId", { strategyId })
                .getOne();
        } catch (error) {
            console.error(
                "Error fetching market data account for strategy:",
                error
            );
        }

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
        const marketDataAccountRepository = this.getRepository();
        const marketDataAccount = await marketDataAccountRepository.findOne({
            where: {
                user: { id: getContextUserId() },
                apiKey,
            },
        });

        return !!marketDataAccount;
    }

    async getMarketDataAccounts() {
        const marketDataAccountRepository = this.getRepository();

        const marketDataAccounts = await marketDataAccountRepository.find({
            where: {
                user: { id: getContextUserId() },
            },
        });

        return marketDataAccounts;
    }

    async getUserMarketDataAccountById(
        marketDataAccountId: number,
        userId: string
    ) {
        const marketDataAccountRepository = this.getRepository();

        return marketDataAccountRepository.findOne({
            where: {
                id: marketDataAccountId,
                user: { id: userId },
            },
        });
    }
}

export const marketDataAccountService = new MarketDataAccountService();
