import { MarketActionStatusEnum } from "../entities/enums/market-action-status.enum";
import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { MarketActionError } from "../errors/market-action.error";
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
        stopLoss?: number,
        takeProfit?: number
    ) {
        if (stopLoss && takeProfit && stopLoss >= takeProfit) {
            throw new MarketActionError(
                "Stop loss must be lower than take profit"
            );
        }

        const marketAction = new MarketAction(
            strategy,
            MarketActionEnum.BUY,
            amount,
            stopLoss,
            takeProfit
        );
        return this.marketActionRepository.save(marketAction);
    }

    /**
     *
     */
    async execute(marketAction: MarketAction, currentPrice: number) {
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

            marketAction.price = currentPrice;

            try {
                marketAction.buyOrderId = await strategyService.buyAsset(
                    marketAction.strategy.id,
                    currentPrice,
                    marketAction.amount
                );
                marketAction.action = MarketActionEnum.HOLD;
            } catch (error: any) {
                return await this.fail(marketAction, error.message);
            }

            return this.marketActionRepository.save(marketAction);
        }

        // If sell, sell the asset and set the sellOrderId if needed, set the status to CLOSED
        if (marketAction.action === MarketActionEnum.SELL) {
            marketAction.closedAt = new Date();
            marketAction.sellPrice = currentPrice;
            marketAction.status = MarketActionStatusEnum.CLOSED;

            try {
                marketAction.sellOrderId = await strategyService.sellAsset(
                    marketAction.strategy.id,
                    currentPrice,
                    marketAction.amount
                );
            } catch (error: any) {
                this.failClose(marketAction, error.message);
            }

            return this.marketActionRepository.save(marketAction);
        }

        // try to stop loss
        if (marketAction.shouldStopLoss(currentPrice)) {
            return await this.close(marketAction, currentPrice);
        }

        // try to take profit
        if (marketAction.shouldTakeProfit(currentPrice)) {
            return await this.close(marketAction, currentPrice);
        }
    }

    async close(marketAction: MarketAction, currentPrice: number) {
        if (marketAction.status === MarketActionStatusEnum.CLOSED) {
            throw new MarketActionError("Market action already closed");
        }

        if (marketAction.status === MarketActionStatusEnum.CANCELLED) {
            throw new MarketActionError("Market action already cancelled");
        }

        if (!marketAction.price) {
            throw new MarketActionError("Market action price not set");
        }

        marketAction.closedAt = new Date();
        marketAction.sellPrice = currentPrice;
        marketAction.status = MarketActionStatusEnum.CLOSED;

        try {
            await strategyService.sellAsset(
                marketAction.strategy.id,
                currentPrice,
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
        status: MarketActionStatusEnum = MarketActionStatusEnum.OPEN
    ) {
        return this.marketActionRepository.find({
            where: {
                strategy: {
                    id: strategyId,
                    user: {
                        id: userId,
                    },
                },
                status,
            },
        });
    }

    async getMarketActionsForStrategy(
        strategyId: number,
        status: MarketActionStatusEnum = MarketActionStatusEnum.OPEN
    ) {
        return this.marketActionRepository.find({
            where: {
                strategy: {
                    id: strategyId,
                },
                status,
            },
            relations: ["strategy"],
        });
    }
}

export const marketActionService = new MarketActionService();
