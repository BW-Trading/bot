import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { Order } from "../entities/order.entity";
import { Position } from "../entities/position.entity";
import { Strategy } from "../entities/strategy.entity";
import { InternalServerError } from "../errors/internal-server.error";
import { NotFoundError } from "../errors/not-found-error";
import { DecimalTransformer } from "../utils/decimal-transformer";
import DatabaseManager from "./database-manager.service";
import { marketDataAccountService } from "./market-data-account.service";
import { OrderSide } from "./market-data/market-data";

class PositionService {
    positionRepository =
        DatabaseManager.getAppDataSource().getRepository(Position);

    async getOrCreatePosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = await this.positionRepository.findOneBy({
            asset: asset,
        });

        if (!position) {
            return this.createPosition(strategy, asset);
        }

        return position;
    }

    async getOrderPositionOrThrow(order: Order) {
        const position = await this.positionRepository.findOneBy({
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
        const position = await this.positionRepository.findOneBy({});

        if (!position) {
            throw new NotFoundError(
                "Position",
                "Position not found for strategy",
                "position.strategy.id"
            );
        }

        return position;
    }

    async getByIdOrThrow(positionId: number) {
        const position = await this.positionRepository.findOneBy({
            id: positionId,
        });
        if (!position) {
            throw new NotFoundError(
                "Position",
                `Position not found with id ${positionId}`,
                "id"
            );
        }
        return position;
    }

    async createPosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = new Position();
        position.asset = asset;
        position.orders = [];
        position.marketDataAccount =
            await marketDataAccountService.getmarketDataAccountForStrategyOrThrow(
                strategy.id
            );

        return this.positionRepository.save(position);
    }

    async updatePosition(positionId: number, quantity: number, price: number) {
        const position = await positionService.getByIdOrThrow(positionId);

        return this.positionRepository.save(position);
    }

    async isPositionEmpty(position: Position) {
        return position.totalQuantity === 0;
    }

    /**
     * This method should be called
     */
    private computeNewRealizedPnL(
        position: Position,
        price: number,
        quantity: number
    ): number {
        if (position.averageEntryPrice === undefined) {
            throw new InternalServerError(
                "Position averageEntryPrice is undefined, cannot compute RealizedPnL",
                {
                    positionId: position.id,
                    price: price,
                    quantity: quantity,
                }
            );
        }

        return DecimalTransformer.from(
            position.realizedPnL +
                (price - position.averageEntryPrice) * quantity
        ).toFixed(8);
    }

    private computeNewAverageEntryPrice(
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
