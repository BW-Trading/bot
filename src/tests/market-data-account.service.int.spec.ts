import { DataSource } from "typeorm";
import { MarketDataAccountService } from "../../src/services/market-data-account.service";
import { WalletService } from "../../src/services/wallet.service";
import { User } from "../../src/entities/user.entity";
import { Wallet } from "../../src/entities/wallet.entity";
import { setUserContext } from "../../src/entities/user.entity";
import { ExchangeApiEnum } from "../../src/services/market-data/exchange-api.enum";
import { AlreadyExistsError } from "../../src/errors/already-exists.error";
import { createTestDataSource } from "../test-datasource";

describe("MarketDataAccountService", () => {
    let dataSource: DataSource;
    let marketDataAccountService: MarketDataAccountService;
    let walletService: WalletService;
    let testUser: User;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        marketDataAccountService = new MarketDataAccountService();
        walletService = new WalletService();

        // Crée un utilisateur manuellement
        const userRepository = dataSource.getRepository(User);
        testUser = userRepository.create({
            username: "testuser",
            password: "hashedpassword",
            salt: "somesalt",
        });
        await userRepository.save(testUser);
    });

    beforeEach(async () => {
        setUserContext(testUser.id, () => {});
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it("should create a market data account with a new wallet", async () => {
        setUserContext(testUser.id, async () => {
            const marketDataAccount =
                await marketDataAccountService.createMarketDataAccount(
                    ExchangeApiEnum.TEST,
                    "my-test-api-key"
                );

            expect(marketDataAccount).toBeDefined();
            expect(marketDataAccount.apiKey).toBe("my-test-api-key");
            expect(marketDataAccount.exchangeApi).toBe(ExchangeApiEnum.TEST);
            expect(marketDataAccount.wallet).toBeDefined();

            const wallet = await dataSource.getRepository(Wallet).findOne({
                where: { id: marketDataAccount.wallet.id },
            });

            expect(wallet).not.toBeNull();
            expect(wallet?.balance).toBe(0);
        });
    });

    it("should throw AlreadyExistsError if API key already exists for user", async () => {
        setUserContext(testUser.id, async () => {
            await marketDataAccountService.createMarketDataAccount(
                ExchangeApiEnum.BINANCE,
                "duplicate-api-key"
            );

            await expect(
                marketDataAccountService.createMarketDataAccount(
                    ExchangeApiEnum.BINANCE,
                    "duplicate-api-key"
                )
            ).rejects.toThrow(AlreadyExistsError);
        });
    });

    it("should return true for existing apiKey", async () => {
        setUserContext(testUser.id, async () => {
            await marketDataAccountService.createMarketDataAccount(
                ExchangeApiEnum.BINANCE,
                "check-key"
            );

            const exists = await marketDataAccountService.existsByApiKey(
                "check-key"
            );
            expect(exists).toBe(true);
        });
    });

    it("should return false for non-existing apiKey", async () => {
        setUserContext(testUser.id, async () => {
            const exists = await marketDataAccountService.existsByApiKey(
                "non-existent-key"
            );
            expect(exists).toBe(false);
        });
    });

    it("should get market data accounts for user", async () => {
        setUserContext(testUser.id, async () => {
            await marketDataAccountService.createMarketDataAccount(
                ExchangeApiEnum.TEST,
                "multi-1"
            );
            await marketDataAccountService.createMarketDataAccount(
                ExchangeApiEnum.TEST,
                "multi-2"
            );

            const accounts =
                await marketDataAccountService.getMarketDataAccounts();

            expect(accounts.length).toBe(2);
            expect(accounts[0].user.id).toBe(testUser.id);
        });
    });
});
