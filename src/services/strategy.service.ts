import { ValidationError } from "class-validator";
import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { Strategy } from "../entities/strategy.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { StrategyConfigValidationError } from "../errors/strategy-config-validation.error";
import { StrategiesEnum } from "../entities/enums/strategies.enum";
import { TestStrategy } from "../strategies/test-strategy";
import { ITradingStrategy } from "../strategies/trading-strategy.interface";
import DatabaseManager from "./database-manager.service";
import { portfolioService } from "./portfolio.service";
import { StrategyManagerService } from "./strategy-manager.service";
import { userService } from "./user.service";

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
            // case StrategiesEnum.MOVING_AVERAGE:
            //     return MovingAverageStrategy;
            default:
                throw new NotFoundError(
                    "Strategy",
                    "Strategy not found",
                    "name"
                );
        }
    }

    async createStrategy(
        userId: string,
        name: string,
        description: string,
        asset: TradeableAssetEnum,
        strategyEnum: StrategiesEnum,
        config: any,
        interval: number,
        balance?: number
    ) {
        const existingStrategy = await this.getUserStrategyByName(userId, name);

        if (existingStrategy) {
            throw new AlreadyExistsError(
                "A strategy with this name already exists"
            );
        }

        const strategyClass = this.getStrategyClass(strategyEnum);
        const errors: ValidationError[] = new strategyClass().validateConfig(
            config
        );

        if (errors.length > 0) {
            throw new StrategyConfigValidationError(errors);
        }

        const strategy = new Strategy();
        strategy.name = name;
        strategy.asset = asset;
        strategy.description = description;
        strategy.strategy = strategyEnum;
        strategy.config = config;
        strategy.interval = interval;
        const portfolio = await portfolioService.createPortfolio(balance || 0);
        strategy.portfolio = portfolio;
        strategy.user = await userService.findById(userId);

        return this.strategyRepository.save(strategy);
    }

    getStrategyByName(name: string) {
        return this.strategyRepository.findOneBy({ name });
    }

    getUserStrategyByName(userId: string, name: string) {
        return this.strategyRepository.findOneBy({
            name,
            user: { id: userId },
        });
    }

    async getUserStrategyByIdOrThrow(userId: string, id: number) {
        const strategy = await this.strategyRepository.findOne({
            where: { id: id, user: { id: userId } },
            relations: ["portfolio", "user"],
        });

        if (!strategy) {
            throw new NotFoundError("Strategy", "Strategy not found", "id");
        }

        return strategy;
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

    async getStrategies(isActive: boolean = true) {
        return await this.strategyRepository.find({
            where: { isActive: isActive },
        });
    }

    async getUserStrategies(userId: string, isActive: boolean = true) {
        const strategies = await this.strategyRepository.find({
            where: {
                isActive: isActive,
                user: { id: userId },
            },
        });

        return strategies;
    }

    async getUserStrategy(userId: string, strategyId: number) {
        return this.strategyRepository.findOne({
            where: {
                id: strategyId,
                user: { id: userId },
            },
            relations: ["user"],
        });
    }

    async getPortfolioForUserStrategy(userId: string, strategyId: number) {
        const strategy = await this.getUserStrategyByIdOrThrow(
            userId,
            strategyId
        );

        return strategy.portfolio;
    }

    async buyAsset(strategyId: number, price: number, amount: number) {
        const strategy = await this.getStrategyByIdOrThrow(strategyId);

        return portfolioService.buyAsset(strategy.portfolio.id, price, amount);
    }

    async sellAsset(strategyId: number, price: number, amount: number) {
        const strategy = await this.getStrategyByIdOrThrow(strategyId);

        return portfolioService.sellAsset(strategy.portfolio.id, price, amount);
    }

    async addBalance(userId: string, strategyId: number, amount: number) {
        const strategy = await this.getUserStrategyByIdOrThrow(
            userId,
            strategyId
        );

        return await portfolioService.addBalance(strategy.portfolio.id, amount);
    }

    async removeBalance(userId: string, strategyId: number, amount: number) {
        const strategy = await this.getUserStrategyByIdOrThrow(
            userId,
            strategyId
        );

        return await portfolioService.removeBalance(
            strategy.portfolio.id,
            amount
        );
    }

    async archiveStrategy(userId: string, strategyId: number) {
        const strategy = await this.getUserStrategyByIdOrThrow(
            userId,
            strategyId
        );

        if (await StrategyManagerService.getInstance().isRunning(strategyId)) {
            StrategyManagerService.getInstance().stopStrategy(strategyId);
        }

        strategy.isActive = false;

        return this.strategyRepository.save(strategy);
    }
}

export const strategyService = new StrategyService();
