import DatabaseManager from "./database-manager.service";
import { StrategyInstanceEnum } from "../strategies/strategies.enum";
import { Strategy } from "../entities/strategy.entity";
import { TestTradingStrategy } from "../strategies/test-strategy";
import { NotFoundError } from "../errors/not-found-error";

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
}

export const strategyService = new StrategyService();
