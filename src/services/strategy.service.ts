import { Strategy } from "../entities/strategy.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { StrategiesEnum } from "../strategies/strategies";
import { TestStrategy } from "../strategies/test-strategy";
import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import DatabaseManager from "./database-manager.service";

class StrategyService {
    private strategyRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(Strategy);

    getRunnableStrategies() {
        return Object.values(StrategiesEnum);
    }

    getStrategyClass(
        strategy: StrategiesEnum
    ): new (...args: any[]) => ITradingStrategy {
        switch (strategy) {
            case StrategiesEnum.TEST:
                return TestStrategy;
            default:
                throw new NotFoundError(
                    "Strategy",
                    "Strategy not found",
                    "name"
                );
        }
    }

    async createStrategy(
        name: string,
        description: string,
        strategyEnum: StrategiesEnum,
        config: any,
        interval: number
    ) {
        const existingStrategy = await this.getStrategyByName(name);
        if (existingStrategy) {
            throw new AlreadyExistsError(
                "A strategy with this name already exists"
            );
        }

        const strategy = new Strategy();
        strategy.name = name;
        strategy.description = description;
        strategy.strategy = strategyEnum;
        strategy.config = config;
        strategy.interval = interval;

        return this.strategyRepository.save(strategy);
    }

    getStrategyByName(name: string) {
        return this.strategyRepository.findBy({ name });
    }

    getStrategyById(id: number) {
        return this.strategyRepository.findBy({ id });
    }

    getStrategies(isActive: boolean = true) {
        return this.strategyRepository.find({
            where: { isActive: isActive },
        });
    }
}

export const strategyService = new StrategyService();
