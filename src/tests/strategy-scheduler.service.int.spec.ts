import { DataSource, Repository } from "typeorm";
import { createTestDataSource } from "../test-datasource";
import { StrategySchedulerService } from "../services/strategy-scheduler.service";
import { Strategy } from "../entities/strategy.entity";
import { User } from "../entities/user.entity";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";

describe("StrategySchedulerService – Integration Tests", () => {
    let ds: DataSource;
    let strategyRepo: Repository<Strategy>;
    let userRepo: Repository<User>;
    let mdaRepo: Repository<MarketDataAccount>;
    let scheduler: StrategySchedulerService;
    let user: User;
    let mda: MarketDataAccount;
    let strategy: Strategy;

    beforeAll(async () => {
        ds = await createTestDataSource();
        strategyRepo = ds.getRepository(Strategy);
        userRepo = ds.getRepository(User);
        mdaRepo = ds.getRepository(MarketDataAccount);
        scheduler = StrategySchedulerService.getInstance();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    beforeEach(async () => {
        await ds.synchronize(true);

        scheduler.clearAll();

        user = await userRepo.save({
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            username: "scheduser",
            password: "pwd",
            salt: "salt",
        });

        mda = await mdaRepo.save({
            exchangeApi: ExchangeApiEnum.TEST,
            apiKey: "key",
            user,
        } as any);

        strategy = await strategyRepo.save({
            name: "SchedStrat",
            description: "Scheduler test strategy",
            asset: "BTCUSDT",
            user,
            strategyType: "TEST",
            config: {},
            state: {},
            status: "active",
            executionInterval: "* * * * *",
            marketDataAccount: mda,
            active: true,
        } as any);
    });

    describe("scheduleStrategy()", () => {
        it("should schedule a strategy successfully", () => {
            expect(scheduler.isScheduled(strategy.id)).toBe(false);
            scheduler.scheduleStrategy(strategy.id, "* * * * *");
            expect(scheduler.isScheduled(strategy.id)).toBe(true);
        });

        it("should throw AlreadyExistsError when scheduling twice", () => {
            scheduler.scheduleStrategy(strategy.id, "* * * * *");
            expect(() =>
                scheduler.scheduleStrategy(strategy.id, "* * * * *")
            ).toThrow(AlreadyExistsError);
        });
    });

    describe("stopScheduledStrategy()", () => {
        it("should stop a scheduled strategy", () => {
            scheduler.scheduleStrategy(strategy.id, "* * * * *");
            expect(scheduler.isScheduled(strategy.id)).toBe(true);

            scheduler.stopScheduledStrategy(strategy.id);
            expect(scheduler.isScheduled(strategy.id)).toBe(false);
        });

        it("should throw NotFoundError when stopping a non-scheduled strategy", () => {
            expect(() => scheduler.stopScheduledStrategy(strategy.id)).toThrow(
                NotFoundError
            );
        });
    });
});
