import { Strategy } from "../entities/strategy.entity";
import { CustomError } from "../errors/custom-error";
import { TradeSignal } from "../strategies/trade-signal";
import { TradingStrategy } from "../strategies/trading-strategy";
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
        let activeStrategy = this.getActiveStrategy(strategy.id);

        if (!activeStrategy) {
            activeStrategy = await strategyService.instantiateStrategy(
                strategy
            );
        }

        const execution = await strategyExecutionService.create(strategy);

        try {
            
            const resultData = await activeStrategy.();
            strategyExecutionService.complete(execution);
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
