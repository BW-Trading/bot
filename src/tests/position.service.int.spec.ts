import { DataSource, Repository } from "typeorm";
import { PositionService } from "../../src/services/position.service";
import {
    Strategy,
    StrategyInstanceStatusEnum,
} from "../../src/entities/strategy.entity";
import { Position } from "../../src/entities/position.entity";
import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderSide } from "../services/market-data/market-data";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";
import { User } from "../entities/user.entity";
import { StrategyInstanceEnum } from "../entities/enums/strategies.enum";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import DatabaseManager from "../services/database-manager.service";
import { createTestDataSource } from "../test-datasource";

describe("PositionService (integration)", () => {
    let dataSource: DataSource;
    let positionService: PositionService;
    let strategyRepo: Repository<Strategy>;
    let positionRepo: Repository<Position>;
    let marketDataAccountRepo: Repository<MarketDataAccount>;
    let userRepo: Repository<User>;
    let account: MarketDataAccount;
    let strategy: Strategy;
    let user: User;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        positionService = new PositionService();
        strategyRepo = dataSource.getRepository(Strategy);
        positionRepo = dataSource.getRepository(Position);
        userRepo = dataSource.getRepository(User);
        marketDataAccountRepo =
            DatabaseManager.getAppDataSource().getRepository(MarketDataAccount);
        user = await userRepo.save({
            id: "550e8400-e29b-41d4-a716-446655440000",
            username: "testuser",
            password: "testpassword",
            salt: "testsalt",
        });
        strategy = await strategyRepo.save({
            id: 1,
            name: "Test Strategy",
            description: "A strategy for testing",
            asset: TradeableAssetEnum.BTCUSDT,
            user: user,
            strategyType: StrategyInstanceEnum.TEST,
            config: {},
            state: {},
            status: StrategyInstanceStatusEnum.ACTIVE,
            executionInterval: "0 * * * *",
        });
        account = await marketDataAccountRepo.save({
            id: 1,
            exchangeApi: ExchangeApiEnum.BINANCE,
            apiKey: "testApiKey",
            user: user,
            strategies: [strategy],
        });
    });

    afterEach(async () => {
        await dataSource.synchronize(true);
    });

    describe("getOrCreatePosition", () => {
        it("should create a new position if none exists", async () => {
            const position = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            expect(position).toBeDefined();
            expect(position.asset).toBe("BTCUSDT");
            expect(position.totalQuantity).toBe(0);
            expect(
                position.marketDataAccount.strategies.some(
                    (s) => s.id === strategy.id
                )
            ).toBe(true);
        });

        it("should return existing position if one already exists", async () => {
            const firstPosition = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.ETHUSDT
            );
            const secondPosition = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.ETHUSDT
            );
            expect(secondPosition.id).toBe(firstPosition.id);
            expect(secondPosition.asset).toBe("ETHUSDT");
        });
    });

    describe("updatePosition", () => {
        it("should update position on BUY", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            const updated = await positionService.updatePosition(
                pos,
                5,
                100,
                OrderSide.BUY
            );
            expect(updated.totalQuantity).toBe(5);
            expect(updated.averageEntryPrice).toBe(100);
        });

        it("should update position on SELL", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.ETHUSDT
            );
            await positionService.updatePosition(pos, 10, 50, OrderSide.BUY);
            const updated = await positionService.updatePosition(
                pos,
                4,
                70,
                OrderSide.SELL
            );
            const expected = (50 * 10 - 70 * 4) / 6;
            expect(updated.averageEntryPrice).toBeCloseTo(expected);

            expect(updated.totalQuantity).toBe(6);
        });

        it("should set position to empty if selling all quantity", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            await positionService.updatePosition(pos, 8, 100, OrderSide.BUY);
            const updated = await positionService.updatePosition(
                pos,
                8,
                120,
                OrderSide.SELL
            );
            expect(updated.totalQuantity).toBe(0);
            expect(updated.averageEntryPrice).toBe(0);
        });
    });

    describe("hasEnoughQuantity", () => {
        it("should return true if position has enough quantity", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            await positionService.updatePosition(pos, 7, 200, OrderSide.BUY);
            const hasEnough = await positionService.hasEnoughQuantity(
                pos,
                5,
                OrderSide.SELL
            );
            expect(hasEnough).toBe(true);
        });

        it("should return false if not enough quantity", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.ETHUSDT
            );
            await positionService.updatePosition(pos, 3, 200, OrderSide.BUY);
            const hasEnough = await positionService.hasEnoughQuantity(
                pos,
                5,
                OrderSide.SELL
            );
            expect(hasEnough).toBe(false);
        });
    });

    describe("getByIdOrThrow", () => {
        it("should return position if it exists", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            const found = await positionService.getByIdOrThrow(pos.id);
            expect(found).toBeDefined();
            expect(found.id).toBe(pos.id);
        });

        it("should throw an error if position does not exist", async () => {
            await expect(
                positionService.getByIdOrThrow(10000)
            ).rejects.toThrow();
        });
    });

    describe("isPositionEmpty", () => {
        it("should return true if position quantity is 0", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.ETHUSDT
            );
            expect(await positionService.isPositionEmpty(pos)).toBe(true);
        });

        it("should return false if position has quantity", async () => {
            const pos = await positionService.getOrCreatePosition(
                strategy,
                TradeableAssetEnum.BTCUSDT
            );
            await positionService.updatePosition(pos, 2, 100, OrderSide.BUY);
            expect(await positionService.isPositionEmpty(pos)).toBe(false);
        });
    });
});
