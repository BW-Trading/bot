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

    scheduleStrategy(strategy: Strategy) {
        if (this.isScheduled(strategy.id)) {
            throw new AlreadyExistsError("Strategy is already scheduled");
        }

        const cronJob = cron.schedule(strategy.executionInterval, () => {
            this.strategyManagerService.executeStrategy(strategy);
        });

        this.scheduledStrategies.set(strategy.id, {
            cronJob,
        });
    }

    stopScheduledStrategy(strategy: Strategy) {
        if (!this.isScheduled(strategy.id)) {
            throw new NotFoundError(
                "Scheduled Strategy",
                "Strategy is not scheduled",
                `${strategy.id}`
            );
        }

        const scheduledStrategy = this.scheduledStrategies.get(strategy.id);
        scheduledStrategy?.cronJob.stop();

        this.scheduledStrategies.delete(strategy.id);
    }

    isScheduled(strategyId: number) {
        return this.scheduledStrategies.has(strategyId);
    }
}
