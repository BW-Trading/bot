import { ITradingStrategy } from "../entities/trading-strategy.interface";

interface StrategyInstance {
    instance: ITradingStrategy;
    intervalId: NodeJS.Timeout;
}

export class StrategyManagerService {
    private strategies: Map<number, StrategyInstance> = new Map();

    startStrategy(
        strategyClass: new (...args: any[]) => ITradingStrategy,
        config: any,
        interval: number
    ) {
        const strategy = new strategyClass(config);

        const intervalId = setInterval(async () => {
            try {
                const result = await strategy.run();
                console.log(`[${strategy.name}] Execution result:`, result);
            } catch (error) {
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
            throw new Error("Strategy not found");
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
}
