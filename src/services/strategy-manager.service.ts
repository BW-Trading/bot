import { StrategyExecutionStatusEnum } from "../entities/enums/strategy-execution-status.enum";
import { ITradingStrategy } from "../entities/interfaces/trading-strategy.interface";
import { MarketAction } from "../entities/market-action.entity";
import { StrategyExecution } from "../entities/strategy-execution.entity";
import { NotFoundError } from "../errors/not-found-error";
import { logger } from "../loggers/logger";
import { StrategiesEnum } from "../strategies/strategies";
import { strategyService } from "./strategy.service";

interface StrategyInstance {
    instance: ITradingStrategy;
    intervalId: NodeJS.Timeout;
}

export class StrategyManagerService {
    private static instance: StrategyManagerService;
    private constructor() {} // Pour empêcher l'instanciation de la classe -> Il faut passer par la méthode statique getInstance
    static getInstance(): StrategyManagerService {
        if (!StrategyManagerService.instance) {
            StrategyManagerService.instance = new StrategyManagerService();
        }

        return StrategyManagerService.instance;
    }

    private strategies: Map<number, StrategyInstance> = new Map();

    async loadStrategies() {
        const strategies = await strategyService.getStrategies();

        strategies.forEach((strategy) => {
            this.startStrategy(
                this.getStrategyClass(strategy.strategy),
                strategy.config,
                strategy.interval
            );
        });

        logger.info(`${strategies.length} active strategies loaded`);
    }

    startStrategy(
        strategyClass: new (...args: any[]) => ITradingStrategy,
        config: any,
        interval: number
    ) {
        const strategy = new strategyClass(config);

        const intervalId = setInterval(async () => {
            const execution = new StrategyExecution();
            execution.status = StrategyExecutionStatusEnum.EXECUTING;
            try {
                const result = await strategy.run();

                const resultingMarketAction = new MarketAction();
                resultingMarketAction.action = result;
                execution.status = StrategyExecutionStatusEnum.COMPLETED;
                execution.resultingMarketAction = resultingMarketAction;
            } catch (error: any) {
                execution.status = StrategyExecutionStatusEnum.FAILED;
                execution.error = error.message;
                execution.failedAt = new Date();
                console.error(`[${strategy.name}] Error:`, error);
            }
        }, interval);

        this.strategies.set(intervalId as unknown as number, {
            instance: strategy,
            intervalId,
        });
        return intervalId;
    }

    stopStrategy(intervalId: number) {
        const strategyInstance = this.strategies.get(intervalId);
        if (!strategyInstance) {
            throw new NotFoundError(
                "Strategy",
                "Strategy not found",
                intervalId.toString()
            );
        }

        clearInterval(strategyInstance.intervalId);
        this.strategies.delete(intervalId);
    }

    stopAllStrategies() {
        this.strategies.forEach(({ intervalId }) => clearInterval(intervalId));
        this.strategies.clear();
    }

    getStrategies(): ITradingStrategy[] {
        return Array.from(this.strategies.values()).map((s) => s.instance);
    }

    getStrategyClass(
        strategy: StrategiesEnum
    ): new (...args: any[]) => ITradingStrategy {
        switch (strategy) {
            case StrategiesEnum.RSI:
            default:
                throw new NotFoundError(
                    "Strategy",
                    "Strategy not found",
                    "name"
                );
        }
    }
}
