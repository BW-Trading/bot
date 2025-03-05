import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import { NotFoundError } from "../errors/not-found-error";
import { logger } from "../loggers/logger";
import { strategyService } from "./strategy.service";
import { Strategy } from "../entities/strategy.entity";
import { strategyExecutionService } from "./strategy-execution.service";
import { marketActionService } from "./market-action.service";
import { MarketAction } from "../entities/market-action.entity";
import { MarketActionEnum } from "../entities/enums/market-action.enum";

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

    async startStrategy(strategy: Strategy) {
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

    async executeSaveMarketActions(strategy: Strategy, marketActions: any[]) {
        await marketActionService.save(marketActions);

        marketActions.forEach(async (action: MarketAction) => {
            try {
                switch (action.action) {
                    case MarketActionEnum.BUY:
                        const result = await strategyService.buyAsset(
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
                    default:
                        logger.error(`Unknown action ${action.action}`);
                        break;
                }

                await marketActionService.executed(action);
            } catch (error: any) {
                await marketActionService.fail(action, error.message);
            }
        });
    }
}
