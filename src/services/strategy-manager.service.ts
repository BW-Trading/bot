import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import { NotFoundError } from "../errors/not-found-error";
import { logger } from "../loggers/logger";
import { strategyService } from "./strategy.service";
import { Strategy } from "../entities/strategy.entity";
import { strategyExecutionService } from "./strategy-execution.service";
import { marketActionService } from "./market-action.service";
import { MarketAction } from "../entities/market-action.entity";
import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { StrategyExecution } from "../entities/strategy-execution.entity";

interface StrategyInstance {
    instance: ITradingStrategy;
    intervalId: NodeJS.Timeout;
    userId: string;
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

    async isRunning(strategyId: number) {
        return this.strategies.has(strategyId);
    }

    async runOnce(strategy: Strategy) {
        const strategyClass = strategyService.getStrategyClass(
            strategy.strategy
        );

        const strategyInstance = new strategyClass(strategy);

        strategyInstance.start();

        let currentExecution;
        try {
            currentExecution = await strategyExecutionService.create(strategy);
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

            await this.executeSaveMarketActions(
                strategy,
                execution,
                resultingMarketActions
            );

            await strategyExecutionService.complete(
                execution,
                resultingMarketActions
            );
        } catch (error: any) {
            await strategyExecutionService.fail(currentExecution, error);
        } finally {
            strategyInstance.stop();
        }
    }

    async startStrategy(strategy: Strategy, userId: string) {
        if (this.strategies.has(strategy.id)) {
            logger.warn(`Strategy ${strategy.id} is already running`);
        }

        const strategyClass = strategyService.getStrategyClass(
            strategy.strategy
        );

        const strategyInstance = new strategyClass(strategy);

        const intervalId = setInterval(async () => {
            if (strategyInstance.getRunning()) {
                logger.warn(`Strategy ${strategy.id} is already running`);
                return;
            }

            strategyInstance.start();

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

                await this.executeSaveMarketActions(
                    strategy,
                    execution,
                    resultingMarketActions
                );

                await strategyExecutionService.complete(
                    execution,
                    resultingMarketActions
                );
            } catch (error: any) {
                await strategyExecutionService.fail(currentExecution, error);
            } finally {
                strategyInstance.stop();
            }
        }, strategy.interval);

        this.strategies.set(strategy.id, {
            instance: strategyInstance,
            intervalId,
            userId: userId,
        });
        return intervalId;
    }

    stopStrategy(strategyId: number) {
        const strategyInstance = this.strategies.get(strategyId);
        if (!strategyInstance) {
            throw new NotFoundError(
                "Strategy",
                "Strategy not found",
                strategyId.toString()
            );
        }

        clearInterval(strategyInstance.intervalId);
        this.strategies.delete(strategyId);
    }

    stopAllStrategies() {
        this.strategies.forEach(({ intervalId }) => clearInterval(intervalId));
        this.strategies.clear();
    }

    getRunningStrategies(userId: string): ITradingStrategy[] {
        return Array.from(this.strategies.values())
            .filter((strategyInstance) => strategyInstance.userId === userId)
            .map((strategyInstance) => strategyInstance.instance);
    }

    async executeSaveMarketActions(
        strategy: Strategy,
        execution: StrategyExecution,
        marketActions: any[]
    ) {
        marketActions.forEach(async (action: MarketAction) => {
            try {
                switch (action.action) {
                    case MarketActionEnum.BUY:
                        await strategyService.buyAsset(
                            strategy.id,
                            action.price,
                            action.amount
                        );
                        break;
                    case MarketActionEnum.SELL:
                        await strategyService.sellAsset(
                            strategy.id,
                            action.price,
                            action.amount
                        );
                        break;
                    case MarketActionEnum.HOLD:
                        break;
                    default:
                        logger.error(`Unknown action ${action.action}`);
                        break;
                }

                await marketActionService.executed(action);
            } catch (error: any) {
                await marketActionService.fail(action, error.message);
            } finally {
                action.strategyExecution = execution;
                await marketActionService.save(marketActions);
            }
        });
    }
}
