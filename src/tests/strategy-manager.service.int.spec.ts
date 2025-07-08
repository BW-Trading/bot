import { DataSource, Repository } from "typeorm";
import { createTestDataSource } from "../test-datasource";
import { StrategyManagerService } from "../services/strategy-manager.service";
import { Strategy } from "../entities/strategy.entity";
import {
    ExecutionStatusEnum,
    StrategyExecution,
} from "../entities/strategy-execution.entity";
import { User } from "../entities/user.entity";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";
import { strategyExecutionService } from "../services/strategy-execution.service";

describe("StrategyManagerService – Integration Tests", () => {
    let ds: DataSource;
    let strategyRepo: Repository<Strategy>;
    let execRepo: Repository<StrategyExecution>;
    let userRepo: Repository<User>;
    let mdaRepo: Repository<MarketDataAccount>;
    let manager: StrategyManagerService;
    let user: User;
    let mda: MarketDataAccount;
    let strategy: Strategy;

    beforeAll(async () => {
        ds = await createTestDataSource();
        strategyRepo = ds.getRepository(Strategy);
        execRepo = ds.getRepository(StrategyExecution);
        userRepo = ds.getRepository(User);
        mdaRepo = ds.getRepository(MarketDataAccount);
        manager = StrategyManagerService.getInstance();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    beforeEach(async () => {
        await ds.synchronize(true);

        user = await userRepo.save({
            id: "11111111-1111-1111-1111-111111111111",
            username: "tester",
            password: "pwd",
            salt: "salt",
        });

        mda = await mdaRepo.save({
            exchangeApi: ExchangeApiEnum.TEST,
            apiKey: "key",
            user,
        } as any);

        strategy = await strategyRepo.save({
            name: "Strat1",
            description: "desc",
            asset: "BTCUSDT",
            user,
            strategyType: "TEST",
            config: {},
            state: {},
            status: "active",
            marketDataAccount: mda,
            executionInterval: "* * * * *",
            active: true,
        } as any);
    });

    describe("executeStrategy() normal flow", () => {
        it("should complete execution with status COMPLETED", async () => {
            await manager.executeStrategy(strategy.id);
            const execs = await execRepo.find({
                where: { strategy: { id: strategy.id } },
            });
            expect(execs.length).toBe(1);
            expect(execs[0].status).toBe(ExecutionStatusEnum.COMPLETED);
        });
    });

    describe("executeStrategy() when already active execution", () => {
        it("should record a failed execution when one is already in progress", async () => {
            await execRepo.save({
                strategy,
                status: ExecutionStatusEnum.PENDING,
            });
            await manager.executeStrategy(strategy.id);

            const execs = await execRepo.find({
                where: { strategy: { id: strategy.id } },
                order: { id: "ASC" },
            });

            expect(execs.length).toBe(2);
            expect(execs[0].status).toBe(ExecutionStatusEnum.PENDING);
            expect(execs[1].status).toBe(ExecutionStatusEnum.FAILED);
        });
    });
});
