import { In } from "typeorm";
import { MarketActionStatusEnum } from "../entities/enums/market-action-status.enum";
import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { MarketActionError } from "../errors/market-action.error";
import { logger } from "../loggers/logger";
import DatabaseManager from "./database-manager.service";
import { strategyService } from "./strategy.service";

class MarketActionService {
    private marketActionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(MarketAction);

    async save(marketActions: MarketAction[]) {
        return this.marketActionRepository.save(marketActions);
    }

    async create(
        strategy: Strategy,
        amount: number,
        buyPrice: number,
        stopLoss?: number,
        takeProfit?: number
    ): Promise<MarketAction> {
        if (stopLoss && takeProfit && stopLoss >= takeProfit) {
            throw new MarketActionError(
                "Stop loss must be lower than take profit"
            );
        }

        const marketAction = new MarketAction(
            strategy,
            MarketActionEnum.BUY,
            amount,
            buyPrice,
            stopLoss,
            takeProfit
        );

        const savedMarketAction = await this.marketActionRepository
            .createQueryBuilder()
            .insert()
            .into(MarketAction)
            .values(marketAction)
            .returning([
                "id",
                "action",
                "amount",
                "buyPrice",
                "stopLoss",
                "takeProfit",
                "createdAt",
            ])
            .execute();

        return savedMarketAction.raw[0];
    }

    /**
     *
     */
    async execute(
        strategyId: number,
        marketAction: MarketAction,
        currentPrice: number
    ) {
        if (
            marketAction.status === MarketActionStatusEnum.CLOSED ||
            marketAction.status === MarketActionStatusEnum.CANCELLED
        ) {
            throw new MarketActionError(
                "Market action already closed or cancelled"
            );
        }

        if (marketAction.action === MarketActionEnum.HOLD) {
            return;
        }

        // If buy, buy the asset and set the buyOrderId if needed, set the action to HOLD
        if (marketAction.action === MarketActionEnum.BUY) {
            // If stop loss reached, cancel the action
            if (
                marketAction.stopLoss &&
                currentPrice <= marketAction.stopLoss
            ) {
                return await this.fail(
                    marketAction,
                    "Stop loss reached before buy"
                );
            }

            // If take profit reached, cancel the action
            if (
                marketAction.takeProfit &&
                currentPrice >= marketAction.takeProfit
            ) {
                return await this.fail(
                    marketAction,
                    "Take profit reached before buy"
                );
            }

            try {
                marketAction.buyOrderId = await strategyService.buyAsset(
                    strategyId,
                    currentPrice,
                    marketAction.amount
                );
                marketAction.action = MarketActionEnum.HOLD;
                marketAction.executedAt = new Date();
            } catch (error: any) {
                marketAction.status = MarketActionStatusEnum.PENDING;
                logger.info(
                    `Failed to buy asset for market action ${marketAction.id} : ${error.message}`
                );
            }

            return this.marketActionRepository.save(marketAction);
        }

        // If sell, sell the asset and set the sellOrderId if needed, set the status to CLOSED
        if (marketAction.action === MarketActionEnum.SELL) {
            try {
                marketAction.sellOrderId = await strategyService.sellAsset(
                    strategyId,
                    currentPrice,
                    marketAction.amount
                );
                marketAction.closedAt = new Date();
                marketAction.sellPrice = currentPrice;
                marketAction.status = MarketActionStatusEnum.CLOSED;
            } catch (error: any) {
                this.failClose(marketAction, error.message);
            }

            return this.marketActionRepository.save(marketAction);
        }

        // try to stop loss
        if (marketAction.shouldStopLoss(currentPrice)) {
            return await this.close(strategyId, marketAction);
        }

        // try to take profit
        if (marketAction.shouldTakeProfit(currentPrice)) {
            return await this.close(strategyId, marketAction);
        }
    }

    async close(strategyId: number, marketAction: MarketAction) {
        if (marketAction.status === MarketActionStatusEnum.CLOSED) {
            throw new MarketActionError("Market action already closed");
        }

        if (marketAction.status === MarketActionStatusEnum.CANCELLED) {
            throw new MarketActionError("Market action already cancelled");
        }

        if (!marketAction.sellPrice) {
            throw new MarketActionError("Market action sell price not set");
        }

        marketAction.closedAt = new Date();
        marketAction.status = MarketActionStatusEnum.CLOSED;

        try {
            await strategyService.sellAsset(
                strategyId,
                marketAction.sellPrice,
                marketAction.amount
            );
        } catch (error: any) {
            return await this.fail(marketAction, error.message);
        }
        return this.marketActionRepository.save(marketAction);
    }

    async failClose(marketAction: MarketAction, reason: string) {
        marketAction.failedAt = new Date();
        marketAction.failedReason = reason;
        return this.marketActionRepository.save(marketAction);
    }

    async fail(marketAction: MarketAction, reason: string) {
        marketAction.status = MarketActionStatusEnum.CANCELLED;
        marketAction.failedAt = new Date();
        marketAction.failedReason = reason;
        return this.marketActionRepository.save(marketAction);
    }

    async getMarketActionsForUserStrategy(
        userId: string,
        strategyId: number,
        status: MarketActionStatusEnum[] = [MarketActionStatusEnum.OPEN]
    ) {
        return this.marketActionRepository.find({
            where: {
                strategy: {
                    id: strategyId,
                    user: {
                        id: userId,
                    },
                },
                status: In(status),
            },
        });
    }

    async getMarketActionsForStrategy(
        strategyId: number,
        status: MarketActionStatusEnum[] = [MarketActionStatusEnum.OPEN]
    ) {
        const marketActions = await this.marketActionRepository.find({
            where: {
                strategy: {
                    id: strategyId,
                },
                status: In(status),
            },
        });

        return marketActions;
    }
}

export const marketActionService = new MarketActionService();
