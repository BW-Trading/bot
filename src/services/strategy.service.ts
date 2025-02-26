import { Portfolio } from "../entities/portfolio.entity";
import { Strategy } from "../entities/strategy.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { StrategiesEnum } from "../strategies/strategies";
import { TestStrategy } from "../strategies/test-strategy";
import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import DatabaseManager from "./database-manager.service";
import { portfolioService } from "./portfolio.service";

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
        asset: string,
        strategyEnum: StrategiesEnum,
        config: any,
        interval: number,
        balance?: number
    ) {
        const existingStrategy = await this.getStrategyByName(name);

        if (existingStrategy) {
            throw new AlreadyExistsError(
                "A strategy with this name already exists"
            );
        }

        const strategy = new Strategy();
        strategy.name = name;
        strategy.asset = asset;
        strategy.description = description;
        strategy.strategy = strategyEnum;
        strategy.config = config;
        strategy.interval = interval;
        const portfolio = await portfolioService.createPortfolio(
            asset,
            balance || 0
        );
        strategy.portfolio = portfolio;

        return this.strategyRepository.save(strategy);
    }

    getStrategyByName(name: string) {
        return this.strategyRepository.findOneBy({ name });
    }

    async getStrategyByIdOrThrow(id: number) {
        const strategy = await this.strategyRepository.findOne({
            where: { id: id },
            relations: ["portfolio"],
        });

        if (!strategy) {
            throw new NotFoundError("Strategy", "Strategy not found", "id");
        }

        return strategy;
    }

    getStrategies(isActive: boolean = true) {
        return this.strategyRepository.find({
            where: { isActive: isActive },
        });
    }

    async getOrdersForStrategy(strategyId: number) {
        const orders = await this.strategyRepository.findOne({
            where: { id: strategyId },
            relations: {
                executions: {
                    resultingMarketActions: true,
                },
            },
        });

        if (!orders) {
            throw new NotFoundError("Strategy", "Strategy not found", "id");
        }

        return orders.executions.flatMap((exec) => exec.resultingMarketActions);
    }

    async getPortfolioForStrategy(strategyId: number) {
        const strategy = await this.getStrategyByIdOrThrow(strategyId);

        return strategy.portfolio;
    }
}

export const strategyService = new StrategyService();
