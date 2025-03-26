import DatabaseManager from "./database-manager.service";
import { StrategyInstanceEnum } from "../strategies/strategies.enum";
import { Strategy } from "../entities/strategy.entity";
import { TestTradingStrategy } from "../strategies/test-strategy";
import { NotFoundError } from "../errors/not-found-error";
import { TradingStrategy } from "../strategies/trading-strategy";
import { orderService } from "./order.service";
import { OrderStatus } from "../entities/order.entity";

class StrategyService {
    private strategyRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(Strategy);

    async instantiateStrategy(strategy: Strategy) {
        switch (strategy.strategyType) {
            case StrategyInstanceEnum.TEST:
                return new TestTradingStrategy(strategy);
            default:
                throw new NotFoundError(
                    "Strategy",
                    `Strategy not found with strategyType: ${strategy.strategyType}`,
                    "strategyType"
                );
        }
    }

    async getByIdOrThrow(strategyId: number) {
        const strategy = await this.strategyRepository.findOneBy({
            id: strategyId,
        });

        if (!strategy) {
            throw new NotFoundError(
                "Strategy",
                `Strategy not found with id ${strategyId}`,
                "id"
            );
        }

        return strategy;
    }

    async sync(strategyInstance: TradingStrategy) {
        const strategy = await this.getByIdOrThrow(
            strategyInstance.getStrategyId()
        );
        // Sync the strategy state
        strategyInstance.setState(strategy.state);

        // Sync the active orders
        strategyInstance.setActiveOrders(
            await orderService.getStrategyOrders(
                strategy.id,
                OrderStatus.PENDING
            )
        );
    }

    async save(strategyInstance: TradingStrategy) {
        const strategy = await this.getByIdOrThrow(
            strategyInstance.getStrategyId()
        );

        // Save the strategy state
        strategy.state = strategyInstance.getState();
        await this.strategyRepository.save(strategy);
    }
}

export const strategyService = new StrategyService();
