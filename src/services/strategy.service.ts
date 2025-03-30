import DatabaseManager from "./database-manager.service";
import { StrategyInstanceEnum } from "../entities/enums/strategies.enum";
import {
    Strategy,
    StrategyInstanceStatusEnum,
} from "../entities/strategy.entity";
import { TestTradingStrategy } from "../strategies/test-strategy";
import { NotFoundError } from "../errors/not-found-error";
import { TradingStrategy } from "../strategies/trading-strategy";
import { orderService } from "./order.service";
import { OrderStatus } from "../entities/order.entity";
import { positionService } from "./position.service";
import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { getContextUserId, User } from "../entities/user.entity";
import { MarketDataAccount } from "../entities/market-data-account.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { marketDataAccountService } from "./market-data-account.service";
import cron from "node-cron";
import { InvalidInputError } from "../errors/invalid-input.error";
import { BadRequestError } from "../errors/bad-request.error";

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

    async getUserStrategyByIdOrThrow(strategyId: number): Promise<Strategy> {
        const strategy = await this.strategyRepository.findOneBy({
            id: strategyId,
            active: true,
            user: { id: getContextUserId() } as User,
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

    async getByName(name: string) {
        return await this.strategyRepository.findOneBy({
            name,
        });
    }

    async sync(strategyInstance: TradingStrategy) {
        const strategy = await this.getByIdOrThrow(
            strategyInstance.getStrategyId()
        );

        // Sync the strategy state
        strategyInstance.setState(strategy.state);

        // Sync the active orders
        strategyInstance.setActiveOrders(
            await orderService.getStrategyOrders(strategy.id, [
                OrderStatus.PENDING,
                OrderStatus.PARTIALLY_FILLED,
            ])
        );
    }

    async save(strategyInstance: TradingStrategy) {
        const strategy = await this.getByIdOrThrow(
            strategyInstance.getStrategyId()
        );

        // Save the strategy state
        strategy.state = strategyInstance.getState();

        // Cancel the deleted orders
        const activeOrders = strategyInstance.getActiveOrders();
        const strategyOrders = await orderService.getStrategyOrders(
            strategy.id,
            [OrderStatus.PENDING]
        );

        for (const order of strategyOrders) {
            if (!activeOrders.find((o) => o.id === order.id)) {
                await orderService.cancel(strategy.id, order);
            }
        }

        await this.strategyRepository.save(strategy);
    }

    async archive(strategy: Strategy) {
        if (!strategy.active) {
            return strategy;
        }

        const position = await positionService.getStrategyPositionOrThrow(
            strategy
        );

        if (position.totalQuantity > 0) {
            throw new Error(
                `Cannot archive strategy ${strategy.id} because it has open positions`
            );
        }

        if (position.orders.length > 0) {
            throw new Error(
                `Cannot archive strategy with open orders: ${position.orders.length}`
            );
        }

        strategy.active = false;

        return this.strategyRepository.save(strategy);
    }

    async getExistingImplementations() {
        return Object.values(StrategyInstanceEnum).map((strategyType) => {
            return {
                name: strategyType,
            };
        });
    }

    async createStrategy(
        name: string,
        description: string,
        asset: TradeableAssetEnum,
        strategyType: StrategyInstanceEnum,
        config: any,
        executionInterval: string,
        marketDataAccountId: number
    ) {
        // Prevent duplicate strategy names
        if (await strategyService.getByName(name)) {
            throw new AlreadyExistsError(
                `Strategy with same name already exists`,
                {
                    name,
                }
            );
        }

        // Check if the user has a market data account
        if (
            !(await marketDataAccountService.getUserMarketDataAccountById(
                marketDataAccountId,
                getContextUserId()
            ))
        ) {
            throw new NotFoundError(
                "MarketDataAccount",
                `Market data account not found`,
                "id"
            );
        }

        if (!cron.validate(executionInterval)) {
            throw new BadRequestError(
                "Given execution interval is not a valid cron expression",
                {
                    executionInterval,
                }
            );
        }

        const strategy = new Strategy();
        strategy.name = name;
        strategy.description = description;
        strategy.asset = asset;
        strategy.user = { id: getContextUserId() } as User;
        strategy.strategyType = strategyType;
        strategy.config = config;
        strategy.state = {};
        strategy.orders = [];
        strategy.status = StrategyInstanceStatusEnum.STOPPED;
        strategy.executions = [];
        strategy.executionInterval = executionInterval;
        strategy.marketDataAccount = {
            id: marketDataAccountId,
        } as MarketDataAccount;
        strategy.active = true;

        return this.strategyRepository.save(strategy);
    }

    /**
     * Get all strategies for the current user
     * @param active - Whether to get only active strategies
     * @param status - The status of the strategies to get
     * @returns The strategies for the current user
     *
     * Note: "active" cannot be false when "status" is "StrategyInstanceStatusEnum.ACTIVE"
     * because a non-active strategy cannot be running.
     */
    async getUserStrategies(
        active: boolean = true,
        status: StrategyInstanceStatusEnum = StrategyInstanceStatusEnum.ACTIVE
    ) {
        return this.strategyRepository.find({
            where: {
                user: { id: getContextUserId() } as User,
                active: active,
                status: status,
            },
        });
    }
}

export const strategyService = new StrategyService();
