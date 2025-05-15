import { Strategy } from "../entities/strategy.entity";
import cron from "node-cron";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { StrategyManagerService } from "./strategy-manager.service";

interface scheduledStrategy {
    cronJob: cron.ScheduledTask;
}

export class StrategySchedulerService {
    private static instance: StrategySchedulerService;
    private strategyManagerService = StrategyManagerService.getInstance();
    private scheduledStrategies: Map<number, scheduledStrategy> = new Map();

    private constructor() {}

    static getInstance() {
        if (!StrategySchedulerService.instance) {
            StrategySchedulerService.instance = new StrategySchedulerService();
        }

        return StrategySchedulerService.instance;
    }

    scheduleStrategy(
        strategyId: number,
        executionInterval: string,
        symbol: string
    ) {
        if (this.isScheduled(strategyId)) {
            throw new AlreadyExistsError("Strategy is already scheduled");
        }

        const cronJob = cron.schedule(executionInterval, () => {
            this.strategyManagerService.executeStrategy(
                strategyId,
                true,
                symbol
            );
        });

        this.scheduledStrategies.set(strategyId, {
            cronJob,
        });
    }

    stopScheduledStrategy(strategyId: number) {
        if (!this.isScheduled(strategyId)) {
            throw new NotFoundError(
                "Scheduled Strategy",
                "Strategy is not scheduled",
                `${strategyId}`
            );
        }

        const scheduledStrategy = this.scheduledStrategies.get(strategyId);
        scheduledStrategy?.cronJob.stop();

        this.scheduledStrategies.delete(strategyId);
        this.strategyManagerService.removeActiveStrategy(strategyId);
    }

    isScheduled(strategyId: number) {
        return this.scheduledStrategies.has(strategyId);
    }
}
