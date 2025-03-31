import { CustomError } from "../errors/custom-error";
import { TradingStrategy } from "../strategies/trading-strategy";
import { marketDataManager } from "./market-data/market-data-manager";
import { orderService } from "./order.service";
import { strategyExecutionService } from "./strategy-execution.service";
import { strategyService } from "./strategy.service";

export class StrategyManagerService {
    private static instance: StrategyManagerService;
    private activateStrategies: Map<number, TradingStrategy> = new Map(); // StrategyId, TradingStrategy

    private constructor() {}

    static getInstance() {
        if (!StrategyManagerService.instance) {
            StrategyManagerService.instance = new StrategyManagerService();
        }

        return StrategyManagerService.instance;
    }

    async executeStrategy(strategyId: number, saveInstance = true) {
        const strategy = await strategyService.getByIdOrThrow(strategyId);

        // Get the active strategy instance if it exists or create a new one
        let activeStrategy = this.getActiveStrategy(strategy.id);

        if (!activeStrategy) {
            activeStrategy = await strategyService.instantiateStrategy(
                strategy
            );
        }

        // Save the active strategy instance if required
        if (saveInstance) {
            this.addActiveStrategy(strategy.id, activeStrategy);
        }

        // Create a StrategyExecution record
        const execution = await strategyExecutionService.create(strategy);

        try {
            // Check if the strategy is already running
            if (
                await strategyExecutionService.hasActiveExecution(strategy.id)
            ) {
                strategyExecutionService.fail(
                    execution,
                    "Strategy is already running"
                );
                return;
            }

            // Update the orders state before syncing the instance
            await orderService.updateOpenOrders(strategy);

            // Sync the strategyInstance with the latest data and order updates
            await strategyService.sync(activeStrategy);

            // Retrieve the market data required by the strategy
            // The market data is retrieve independently from the strategy execution to avoid blocking the execution and improve performance
            const marketData = await marketDataManager.retrieveMarketData(
                strategy.id,
                activeStrategy.getRequiredMarketData()
            );
            // Analyze the market data and generate signals for processing
            activeStrategy.analyze(marketData);

            const signals = activeStrategy.generateSignals();

            // Save the strategy state after processing the signals
            await strategyService.save(activeStrategy);

            // Compute the signals and complete the execution
            await orderService.placeOrders(strategy.id, signals);

            await strategyExecutionService.complete(execution, {
                signals: signals,
                state: activeStrategy.getState(),
            });
        } catch (error) {
            if (error instanceof CustomError) {
                strategyExecutionService.fail(
                    execution,
                    error.toLogObject().toString()
                );
            } else {
                strategyExecutionService.fail(
                    execution,
                    "An unexpected error occurred while executing the strategy"
                );
            }
        }
    }

    getActiveStrategy(strategyId: number) {
        return this.activateStrategies.get(strategyId);
    }

    addActiveStrategy(strategyId: number, tradingStrategy: TradingStrategy) {
        this.activateStrategies.set(strategyId, tradingStrategy);
    }

    removeActiveStrategy(strategyId: number) {
        this.activateStrategies.delete(strategyId);
    }
}
