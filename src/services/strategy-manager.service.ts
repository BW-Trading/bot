import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import { NotFoundError } from "../errors/not-found-error";
import { logger } from "../loggers/logger";
import { strategyService } from "./strategy.service";
import { Strategy } from "../entities/strategy.entity";
import { strategyExecutionService } from "./strategy-execution.service";
import { marketActionService } from "./market-action.service";

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

    async loadAllStrategies() {
        const strategies = await strategyService.getStrategies();

        strategies.forEach(async (strategy) => {
            await this.startStrategy(strategy);
        });

        logger.info(`${strategies.length} active strategies loaded`);
    }

    async startStrategy(strategy: Strategy) {
        const strategyClass = strategyService.getStrategyClass(
            strategy.strategy
        );
        const config = strategy.config;
        const interval = strategy.interval;
        const name = strategy.name;
        const strategyInstance = new strategyClass(name, config, interval);

        const intervalId = setInterval(async () => {
            let currentExecution;
            try {
                currentExecution = await strategyExecutionService.create(
                    strategy
                );
            } catch (error) {
                logger.error(
                    `Error creating execution for strategy ${strategy.id}`
                );
                return;
            }

            try {
                const execution = await strategyExecutionService.execute(
                    currentExecution
                );

                const resultingMarketActions = await strategyInstance.run();

                const marketAction = await marketActionService.save(
                    resultingMarketActions
                );

                await strategyExecutionService.complete(
                    execution,
                    marketAction
                );
            } catch (error: any) {
                await strategyExecutionService.fail(currentExecution, error);
            }
        }, interval);

        this.strategies.set(intervalId as unknown as number, {
            instance: strategyInstance,
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

    getRunningStrategies(): ITradingStrategy[] {
        return Array.from(this.strategies.values()).map((s) => s.instance);
    }
}
