import { Order, OrderStatus } from "../entities/order.entity";
import { Strategy } from "../entities/strategy.entity";
import { TradeSignal } from "../strategies/trade-signal";
import DatabaseManager from "./database-manager.service";
import { marketDataManager } from "./market-data/market-data-manager";
import { positionService } from "./position.service";
import { strategyService } from "./strategy.service";
import {
    OrderSide,
    PlaceOrderResponse,
    PlaceOrderStatus,
    TradingOrderStatus,
} from "./market-data/market-data";
import { logger } from "../loggers/logger";
import { NotFoundError } from "../errors/not-found-error";
import { In } from "typeorm";
import { walletService } from "./wallet.service";
import { CustomError } from "../errors/custom-error";
import { ErrorHandlerService } from "./error-handler.service";
import NotImplementedError from "../errors/not-implemented.error";
import { getContextUserId } from "../entities/user.entity";
import { Position } from "../entities/position.entity";
import { InternalServerError } from "../errors/internal-server.error";

class OrderService {
    private orderRepository =
        DatabaseManager.getAppDataSource().getRepository(Order);

    async getByIdOrThrow(id: number) {
        const order = await this.orderRepository.findOneBy({
            id: id,
        });

        if (!order) {
            throw new NotFoundError(
                "Order",
                `Order not found with id: ${id}`,
                "id"
            );
        }

        return order;
    }

    async createOrder(strategy: Strategy, tradeSignal: TradeSignal) {
        const order = new Order();
        order.strategy = strategy;
        order.side = tradeSignal.action;
        order.type = tradeSignal.type;
        order.asset = tradeSignal.asset;
        order.quantity = tradeSignal.quantity;
        order.filledQuantity = 0;
        order.price = tradeSignal.price;
        order.position = await positionService.getOrCreatePosition(
            strategy,
            tradeSignal.asset
        );

        return (
            await this.orderRepository
                .createQueryBuilder()
                .insert()
                .into(Order)
                .values(order)
                .returning([
                    "id",
                    "side",
                    "type",
                    "status",
                    "asset",
                    "quantity",
                    "price",
                    "fee",
                    "orderId",
                    "position",
                    "createdAt",
                    "executedAt",
                    "canceledAt",
                    "failReason",
                ])
                .execute()
        ).raw[0] as Order;
    }

    async getByOrderIdOrThrow(orderId: string) {
        const order = await this.orderRepository.findOneBy({
            orderId: orderId,
        });

        if (!order) {
            throw new NotFoundError(
                "Order",
                `Order not found with orderId: ${orderId}`,
                "orderId"
            );
        }

        return order;
    }

    async getStrategyOrders(strategyId: number, status?: OrderStatus[]) {
        return this.orderRepository.find({
            where: {
                strategy: { id: strategyId },
                status: status ? In(status) : undefined,
            },
        });
    }

    async placeOrders(strategyId: number, tradeSignals: TradeSignal[]) {
        for (const tradeSignal of tradeSignals) {
            await this.placeOrder(strategyId, tradeSignal);
        }
    }

    async placeOrder(strategyId: number, tradeSignal: TradeSignal) {
        let order: Order;
        let strategy: Strategy;

        // Check if the strategy is active & create the order
        try {
            await this.validateOrder(strategyId, tradeSignal);
            strategy = await strategyService.getByIdOrThrow(strategyId);
            order = await this.createOrder(strategy, tradeSignal);
        } catch (error: any) {
            ErrorHandlerService.getInstance().logError(error);
            return;
        }

        // Try to place the order
        try {
            const wallet = await walletService.getByStrategyIdOrThrow(
                strategyId
            );

            const position = await positionService.getOrCreatePosition(
                strategy,
                order.asset
            );

            const totalSimulatedCost =
                this.computeOrderTotalCost(order, 1); // TEMP fee = 1, to be replaced with real fee

            switch (order.side) {
                case OrderSide.BUY:
                    await walletService.reserveBalance(
                        wallet,
                        totalSimulatedCost
                    );
                    break;
                case OrderSide.SELL:
                    await positionService.hasEnoughQuantity(
                        position,
                        order.quantity,
                        order.side
                    );
                    break;
            }

            const result: PlaceOrderResponse =
                await marketDataManager.placeOrder(strategy.id, order);

            if (result.status === PlaceOrderStatus.SUCCESS) {
                const placedOrder = await this.placed(order, result);

                // Update wallet with real fee
                const feeDifference = 1 - result.data.fee; // TEMP fee = 1, to be replaced with real fee
                await walletService.addReservedBalance(
                    wallet,
                    feeDifference
                );
            } else {
                await this.rejected(
                    order,
                    `${result.code} - ${result.errorMessage}`
                );
            }
        } catch (error: any) {
            if (error instanceof CustomError) {
                await this.rejected(order, JSON.stringify(error.toLogObject()));
            } else {
                this.rejected(
                    order,
                    "Failed to place order for an unknown reason"
                );
            }
        }
    }

    async placed(order: Order, placeOrderResponse: PlaceOrderResponse) {
        order.status = OrderStatus.PENDING;
        order.orderId = placeOrderResponse.data.orderId;
        order.fee = placeOrderResponse.data.fee;

        return await this.orderRepository.save(order);
    }

    /**
     * TODO : Throw on error, check error handling on method calls
     */
    async updateOrder(
        order: Order,
        orderStatusUpdate: TradingOrderStatus,
        strategy: Strategy
    ) {
        const position: Position = await positionService.getOrCreatePosition(
            strategy,
            order.asset
        );

        if (orderStatusUpdate.status === OrderStatus.REJECTED) {
            await this.rejected(
                order,
                `Order ${order.id} was rejected: ${orderStatusUpdate.extra}`
            );
            return;
        }

        if (orderStatusUpdate.status === OrderStatus.CREATED) {
            logger.error(
                `Trying to update the status of order [${order.id}] which is in CREATED status. This should not happen.`
            );
            return;
        }

        switch (orderStatusUpdate.status) {
            case OrderStatus.PARTIALLY_FILLED:
                return await this.filledPartial(
                    order,
                    orderStatusUpdate.quantity,
                    position
                );
                break;

            case OrderStatus.FILLED:
                return await this.filled(order, position);
                break;

            case OrderStatus.CANCELED:
                return await this.canceled(order);
                break;

            case OrderStatus.EXPIRED:
                return await this.expired(order);
                break;

            default:
                logger.warn(
                    `Unknown order status update for order ${order.id}: Current[${order.status}] - New[${orderStatusUpdate.status}]`
                );
        }
    }

    async updateOpenOrders(strategy: Strategy) {
        const orders = await this.getStrategyOrders(strategy.id, [
            OrderStatus.PENDING,
            OrderStatus.PARTIALLY_FILLED,
        ]);

        for (const order of orders) {
            const position: Position =
                await positionService.getOrCreatePosition(
                    strategy,
                    order.asset
                );

            if (
                ![OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED].includes(
                    order.status
                )
            )
                continue;

            try {
                const orderStatusUpdate: TradingOrderStatus =
                    await marketDataManager.getOrderStatus(strategy.id, order);

                await this.updateOrder(order, orderStatusUpdate, strategy);
            } catch (error) {
                logger.error(
                    `Failed to update order ${order.id} for strategy ${strategy.id}`,
                    error
                );
            }
        }
    }

    async getUpdatedUserOrderStatus(orderId: number) {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
                strategy: {
                    user: { id: getContextUserId() },
                },
            },
            relations: {
                strategy: {
                    user: true,
                },
            },
        });

        if (!order) {
            throw new NotFoundError(
                "Order",
                `Order not found with id ${orderId}`,
                "id"
            );
        }

        try {
            const orderStatusUpdate: TradingOrderStatus =
                await marketDataManager.getOrderStatus(
                    order.strategy.id,
                    order
                );

            await this.updateOrder(order, orderStatusUpdate, order.strategy);

            return await this.getByIdOrThrow(order.id);
        } catch (error) {
            logger.error(`Failed to update order ${order.id}`, error);
        }
    }

    async filledPartial(
        order: Order,
        filledQuantity: number,
        position: Position
    ) {
        if (order.status === OrderStatus.PARTIALLY_FILLED) {
            const newlyFilledQuantity = order.filledQuantity! - filledQuantity;
            order.filledQuantity = filledQuantity;

            const wallet = await walletService.getByOrderIdOrThrow(order.id);

            switch (order.side) {
                case OrderSide.BUY:
                    await walletService.placeBalance(
                        wallet,
                        order.price * newlyFilledQuantity
                    );
                    break;
                case OrderSide.SELL:
                    await walletService.releasePlacedBalance(
                        wallet,
                        order.price * newlyFilledQuantity
                    );
                    break;
            }

            await positionService.updatePosition(
                position,
                newlyFilledQuantity,
                order.price,
                order.side
            );
        } else {
            // Update wallet
            const wallet = await walletService.getByOrderIdOrThrow(order.id);
            switch (order.side) {
                case OrderSide.BUY:
                    await walletService.placeBalance(
                        wallet,
                        order.price * filledQuantity
                    );
                    break;
                case OrderSide.SELL:
                    // TBD : incomplete
                    await walletService.releasePlacedBalance(
                        wallet,
                        order.price * filledQuantity
                    );
                    break;
            }

            // Update position TBD
            await positionService.updatePosition(
                position,
                filledQuantity,
                order.price,
                order.side
            );
        }

        order.status = OrderStatus.PARTIALLY_FILLED;
        order.filledQuantity = filledQuantity;
        order.executedAt = new Date();

        return await this.orderRepository.save(order);
    }

    async filled(order: Order, position: Position) {
        if (order.status === OrderStatus.PARTIALLY_FILLED) {
            const newlyFilledQuantity = order.quantity - order.filledQuantity;
            const wallet = await walletService.getByOrderIdOrThrow(order.id);

            switch (order.side) {
                case OrderSide.BUY:
                    await walletService.placeBalance(
                        wallet,
                        order.price * newlyFilledQuantity
                    );
                    break;
                case OrderSide.SELL:
                    if (!position.averageEntryPrice) {
                        throw new InternalServerError(
                            "Trying to sell without average entry price"
                        );
                    }

                    const sellValue = newlyFilledQuantity * order.price;
                    const currentBalanceEquivalent =
                        position.averageEntryPrice * newlyFilledQuantity;
                    await walletService.addPlacedBalance(
                        wallet,
                        -currentBalanceEquivalent
                    );
                    await walletService.addBalance(wallet, sellValue);
                    break;
            }
            await positionService.updatePosition(
                position,
                newlyFilledQuantity,
                order.price,
                order.side
            );
        } else {
            const wallet = await walletService.getByOrderIdOrThrow(order.id);
            switch (order.side) {
                case OrderSide.BUY:
                    await walletService.placeBalance(
                        wallet,
                        order.price * order.quantity
                    );

                    // Remove the cost from reserved balance
                    await walletService.addReservedBalance(
                        wallet,
                        -(order.fee || 0)
                    );

                    break;
                case OrderSide.SELL:
                    if (!position.averageEntryPrice) {
                        throw new InternalServerError(
                            "Trying to sell without average entry price"
                        );
                    }

                    const sellValue = order.quantity * order.price;
                    const currentBalanceEquivalent =
                        position.averageEntryPrice * order.quantity;

                    await walletService.addPlacedBalance(
                        wallet,
                        -currentBalanceEquivalent
                    );
                    await walletService.addBalance(wallet, sellValue);
                    break;
            }
            // Update position TBD
            await positionService.updatePosition(
                position,
                order.quantity,
                order.price,
                order.side
            );
        }

        order.status = OrderStatus.FILLED;
        order.filledQuantity = order.quantity;
        order.executedAt = new Date();

        return await this.orderRepository.save(order);
    }

    async rejected(order: Order, reason: string) {
        order.status = OrderStatus.REJECTED;
        order.failReason = reason;
        order.canceledAt = new Date();

        return await this.orderRepository.save(order);
    }

    async expired(order: Order) {
        if (order.status === OrderStatus.PARTIALLY_FILLED) {
            // Release the reserved balance for the amount that was not filled
            const notFilledQuantity = order.quantity - order.filledQuantity!;
            const wallet = await walletService.getByOrderIdOrThrow(order.id);
            await walletService.releaseReservedBalance(
                wallet,
                order.price * notFilledQuantity
            );

            order.status = OrderStatus.EXPIRED;

            // Update position TBD

            return await this.orderRepository.save(order);
        }

        order.status = OrderStatus.EXPIRED;
        order.canceledAt = new Date();
        order.failReason = "Order expired";

        // Update wallet
        const wallet = await walletService.getByOrderIdOrThrow(order.id);
        await walletService.releasePlacedBalance(
            wallet,
            this.computeOrderTotalCost(order, order.fee)
        );

        // Update position TBD

        return await this.orderRepository.save(order);
    }

    async canceled(order: Order) {
        if (order.status === OrderStatus.PARTIALLY_FILLED) {
            // Release the reserved balance for the amount that was not filled
            const notFilledQuantity = order.quantity - order.filledQuantity!;
            const wallet = await walletService.getByOrderIdOrThrow(order.id);
            await walletService.releaseReservedBalance(
                wallet,
                order.price * notFilledQuantity
            );

            order.status = OrderStatus.CANCELED;

            // Update position TBD

            return await this.orderRepository.save(order);
        }

        order.status = OrderStatus.CANCELED;
        order.canceledAt = new Date();
        return await this.orderRepository.save(order);
    }

    async cancel(strategyId: number, order: Order) {
        throw new NotImplementedError();

        const strategy = await strategyService.getByIdOrThrow(strategyId);

        const result: PlaceOrderResponse = await marketDataManager.cancelOrder(
            strategy.id,
            order
        );

        if (result.status === PlaceOrderStatus.SUCCESS) {
            await this.canceled(order);
        } else {
            logger.error(`Failed to cancel order ${order.id}`, result);
        }
    }

    computeOrderTotalCost(order: Order, fee: number = 0): number {
        return order.price * order.quantity + fee;
    }

    async validateOrder(
        strategyId: number,
        tradeSignal: TradeSignal
    ): Promise<void> {
        // Check with wallet service if the user has enough balance
        // Potentially estimate the fee
    }
}

export const orderService = new OrderService();
