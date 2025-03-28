import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { Order, OrderSide, OrderStatus } from "../entities/order.entity";
import { Position } from "../entities/position.entity";
import { Strategy } from "../entities/strategy.entity";
import { InternalServerError } from "../errors/internal-server.error";
import { NotFoundError } from "../errors/not-found-error";
import { DecimalTransformer } from "../utils/decimal-transformer";
import DatabaseManager from "./database-manager.service";

class PositionService {
    positionRepository =
        DatabaseManager.getAppDataSource().getRepository(Position);

    async getOrCreatePosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = await this.positionRepository.findOneBy({
            strategy: { id: strategy.id },
            asset: asset,
        });

        if (!position) {
            return this.createPosition(strategy, asset);
        }

        return position;
    }

    async getOrderPositionOrThrow(order: Order) {
        const position = await this.positionRepository.findOneBy({
            strategy: { id: order.strategy.id },
            asset: order.asset,
        });

        if (!position) {
            throw new InternalServerError("Position not found for order", {
                orderId: order.id,
                asset: order.asset,
            });
        }

        return position;
    }

    async getStrategyPositionOrThrow(strategy: Strategy) {
        const position = await this.positionRepository.findOneBy({
            strategy: { id: strategy.id },
        });

        if (!position) {
            throw new NotFoundError(
                "Position",
                "Position not found for strategy",
                "position.strategy.id"
            );
        }

        return position;
    }

    async createPosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = new Position();
        position.strategy = strategy;
        position.asset = asset;
        position.orders = [];

        return this.positionRepository.save(position);
    }

    async updatePosition(order: Order) {
        const position = await this.getOrderPositionOrThrow(order);

        // If the order is not executed, we don't need to update the position
        if (order.status !== OrderStatus.EXECUTED) {
            return position;
        }

        if (order.side === OrderSide.BUY) {
            position.totalQuantity += order.quantity || 0;
        } else {
            position.totalQuantity -= order.quantity || 0;
        }
        position.averageEntryPrice = this.computeAverageEntryPrice(
            position,
            order
        );
        position.realizedPnL = this.computeRealizedPnL(position, order);

        return this.positionRepository.save(position);
    }

    async isPositionEmpty(position: Position) {
        return position.totalQuantity === 0;
    }

    computeRealizedPnL(position: Position, order: Order): number {
        if (position.averageEntryPrice === undefined) {
            throw new InternalServerError(
                "Position averageEntryPrice is undefined, cannot compute RealizedPnL",
                {
                    orderId: order.id,
                    positionId: position.id,
                }
            );
        }

        if (order.price === undefined || order.quantity === undefined) {
            throw new InternalServerError(
                "Order price or quantity is undefined, cannot compute RealizedPnL",
                {
                    orderId: order.id,
                    positionId: position.id,
                }
            );
        }

        if (order.side === OrderSide.SELL) {
            return DecimalTransformer.from(
                position.realizedPnL +
                    (order.price - position.averageEntryPrice) * order.quantity
            ).toFixed(8);
        } else {
            return position.realizedPnL;
        }
    }

    computeAverageEntryPrice(
        position: Position,
        order: Order
    ): number | undefined {
        if (order.side === OrderSide.SELL) {
            return position.averageEntryPrice;
        }

        if (order.price === undefined || order.quantity === undefined) {
            throw new InternalServerError(
                "Order price or quantity is undefined, cannot compute AverageEntryPrice",
                {
                    orderId: order.id,
                    positionId: position.id,
                }
            );
        }

        if (order.side === OrderSide.BUY) {
            if (!position.averageEntryPrice) {
                return order.price;
            } else {
                return DecimalTransformer.from(
                    (position.averageEntryPrice * position.totalQuantity +
                        order.price * order.quantity) /
                        (position.totalQuantity + order.quantity)
                ).toFixed(8);
            }
        }
    }
}

export const positionService = new PositionService();
