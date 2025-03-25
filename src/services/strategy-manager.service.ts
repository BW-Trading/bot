import { Strategy } from "../entities/strategy.entity";
import { CustomError } from "../errors/custom-error";
import { TradeSignal } from "../strategies/trade-signal";
import { TradingStrategy } from "../strategies/trading-strategy";
import { marketDataManager } from "./market-data/market-data-manager";
import { strategyExecutionService } from "./strategy-execution.service";
import { strategyService } from "./strategy-instance.service";

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

    async executeStrategy(strategy: Strategy, saveInstance = true) {
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
            // Sync the strategy with the latest data
            await strategyService.sync(activeStrategy);

            // Retrieve the market data required by the strategy
            const requiredMarketData =
                await activeStrategy.getRequiredMarketData();

            const marketData = await marketDataManager.retrieveMarketData(
                strategy.id,
                requiredMarketData
            );

            // Analyze the market data and generate signals for processing
            activeStrategy.analyze(marketData);
            const resultData = await activeStrategy.generateSignals();

            // Save the strategy state after processing the signals
            await strategyService.save(activeStrategy);

            // Compute the signals and complete the execution
            this.computeSignals(resultData);

            strategyExecutionService.complete(execution, {
                signals: resultData,
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

    computeSignals(signals: TradeSignal[]) {
        signals.forEach((signal) => {
            this.computeSignal(signal);
        });
    }

    computeSignal(signal: TradeSignal) {}

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
