import { DataSource, Repository } from "typeorm";
import { createTestDataSource } from "../test-datasource";
import { StrategyExecutionService } from "../services/strategy-execution.service";
import { Strategy } from "../entities/strategy.entity";
import {
    StrategyExecution,
    ExecutionStatusEnum,
} from "../entities/strategy-execution.entity";
import { User } from "../entities/user.entity";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";

describe("StrategyExecutionService – integration tests", () => {
    let ds: DataSource;
    let strategyRepo: Repository<Strategy>;
    let execRepo: Repository<StrategyExecution>;
    let userRepo: Repository<User>;
    let mdaRepo: Repository<MarketDataAccount>;
    let service: StrategyExecutionService;
    let user: User;
    let mda: MarketDataAccount;
    let strategy: Strategy;

    beforeAll(async () => {
        ds = await createTestDataSource();
        strategyRepo = ds.getRepository(Strategy);
        execRepo = ds.getRepository(StrategyExecution);
        userRepo = ds.getRepository(User);
        mdaRepo = ds.getRepository(MarketDataAccount);
        service = new StrategyExecutionService();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    beforeEach(async () => {
        await ds.synchronize(true);

        user = await userRepo.save({
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            username: "testUser",
            password: "pwd",
            salt: "salt",
        });

        mda = await mdaRepo.save({
            exchangeApi: ExchangeApiEnum.BINANCE,
            apiKey: "key",
            user,
        } as any);

        strategy = await strategyRepo.save({
            name: "TestStrat",
            description: "desc",
            asset: "BTCUSDT",
            user,
            strategyType: "TEST",
            config: {},
            state: {},
            status: "active",
            marketDataAccount: mda,
            executionInterval: "* * * * *",
        } as any);
    });

    describe("hasActiveExecution()", () => {
        it("returns false when no execution exists", async () => {
            const has = await service.hasActiveExecution(strategy.id);
            expect(has).toBe(false);
        });

        it("should return true if a PENDING execution exists", async () => {
            await service.create(strategy);
            expect(await service.hasActiveExecution(strategy.id)).toBe(true);
        });

        it("should return true if an IN_PROGRESS execution exists", async () => {
            const exec = await service.create(strategy);
            await service.start(exec, {});
            expect(await service.hasActiveExecution(strategy.id)).toBe(true);
        });
    });

    describe("create()", () => {
        it("creates a PENDING execution linked to the strategy", async () => {
            const exec = await service.create(strategy);
            expect(exec.id).toBeDefined();
            expect(exec.strategy.id).toBe(strategy.id);
            expect(exec.status).toBe(ExecutionStatusEnum.PENDING);

            const fromDb = await execRepo.findOneBy({ id: exec.id });
            expect(fromDb).toBeTruthy();
        });
    });

    describe("start()", () => {
        it("sets status to IN_PROGRESS and startedAt", async () => {
            const exec = await service.create(strategy);
            const started = await service.start(exec, { foo: "bar" });
            expect(started.status).toBe(ExecutionStatusEnum.IN_PROGRESS);
            expect(started.startedAt).toBeInstanceOf(Date);
        });
    });

    describe("complete()", () => {
        it("sets status to COMPLETED, completedAt and resultData", async () => {
            const exec = await service.create(strategy);
            await service.start(exec, {});
            const result = { ok: true };
            const completed = await service.complete(exec, result);
            expect(completed.status).toBe(ExecutionStatusEnum.COMPLETED);
            expect(completed.completedAt).toBeInstanceOf(Date);
            expect(completed.resultData).toEqual(result);
        });
    });

    describe("fail()", () => {
        it("sets status to FAILED, failedAt and errorMessage", async () => {
            const exec = await service.create(strategy);
            const msg = "something went wrong";
            const failed = await service.fail(exec, msg);
            expect(failed.status).toBe(ExecutionStatusEnum.FAILED);
            expect(failed.failedAt).toBeInstanceOf(Date);
            expect(failed.errorMessage).toBe(msg);
        });
    });
});
