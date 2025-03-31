import { Order, OrderSide, OrderStatus } from "../entities/order.entity";
import { Strategy } from "../entities/strategy.entity";
import { TradeSignal } from "../strategies/trade-signal";
import DatabaseManager from "./database-manager.service";
import { marketDataManager } from "./market-data/market-data-manager";
import { positionService } from "./position.service";
import { strategyService } from "./strategy.service";
import {
    PlaceOrderResponse,
    PlaceOrderStatus,
} from "./market-data/market-data";
import { logger } from "../loggers/logger";
import { NotFoundError } from "../errors/not-found-error";
import { In } from "typeorm";
import { walletService } from "./wallet.service";
import { CustomError } from "../errors/custom-error";
import { ErrorHandlerService } from "./error-handler.service";

class OrderService {
    private orderRepository =
        DatabaseManager.getAppDataSource().getRepository(Order);

    async createOrder(strategy: Strategy, tradeSignal: TradeSignal) {
        const order = new Order();
        order.strategy = strategy;
        order.side = tradeSignal.action;
        order.type = tradeSignal.type;
        order.asset = tradeSignal.asset;
        order.quantity = tradeSignal.quantity;
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
            const result: PlaceOrderResponse =
                await marketDataManager.placeOrder(strategy.id, order);

            if (result.status === PlaceOrderStatus.SUCCESS) {
                await this.placed(order, result);
                // Update the wallet
                // await walletService.res(wallet, order);
            } else {
                await this.rejected(
                    order,
                    `${result.code} - ${result.errorMessage}`
                );
            }
        } catch (error) {
            if (error instanceof CustomError) {
                await this.rejected(order, error.toJSON().toString());
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

    async updateOrder(order: Order, placeOrderResponse: PlaceOrderResponse) {}

    async updateOpenOrders(strategy: Strategy) {
        const orders = await this.getStrategyOrders(strategy.id, [
            OrderStatus.PENDING,
            OrderStatus.PARTIALLY_FILLED,
        ]);

        for (const order of orders) {
            try {
                // const result: PlaceOrderResponse =
                //     await marketDataManager.getOrderStatus(strategy.id, order);
                // if (result.status === PlaceOrderStatus.SUCCESS) {
                //     await this.updateOrder(order, result);
                // } else {
                //     logger.error(`Failed to update order ${order.id}`, result);
                // }
            } catch (error) {
                logger.error(
                    `Failed to update order ${order.id} for strategy ${strategy.id}`,
                    error
                );
            }
        }
    }

    async rejected(order: Order, reason: string) {
        order.status = OrderStatus.REJECTED;
        order.failReason = reason;

        return await this.orderRepository.save(order);
    }

    async canceled(order: Order) {
        order.status = OrderStatus.CANCELED;
        order.canceledAt = new Date();

        return await this.orderRepository.save(order);
    }

    async cancel(strategyId: number, order: Order) {
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

    async validateOrder(
        strategyId: number,
        tradeSignal: TradeSignal
    ): Promise<void> {
        // Check with wallet service if the user has enough balance
        // Potentially estimate the fee
    }
}

export const orderService = new OrderService();
