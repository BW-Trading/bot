import { Order, OrderStatus } from "../entities/order.entity";
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

    async getStrategyOrders(strategyId: number, status?: OrderStatus) {
        return this.orderRepository.find({
            where: {
                strategy: { id: strategyId },
            },
        });
    }

    async placeOrders(strategyId: number, tradeSignals: TradeSignal[]) {
        for (const tradeSignal of tradeSignals) {
            try {
                await this.placeOrder(strategyId, tradeSignal);
            } catch (error) {
                logger.error(
                    `Failed to place order for strategy ${strategyId} and asset ${tradeSignal.asset}`,
                    error
                );
            }
        }
    }

    async placeOrder(strategyId: number, tradeSignal: TradeSignal) {
        const strategy = await strategyService.getByIdOrThrow(strategyId);

        const order = await this.createOrder(strategy, tradeSignal);
        const result: PlaceOrderResponse = await marketDataManager.placeOrder(
            strategy.id,
            order
        );

        if (result.status === PlaceOrderStatus.SUCCESS) {
            await this.placed(order, result);
        } else {
            await this.failed(order, `${result.code} - ${result.errorMessage}`);
        }
    }

    async placed(order: Order, placeOrderResponse: PlaceOrderResponse) {
        order.status = OrderStatus.PLACED;
        order.orderId = placeOrderResponse.data.orderId;
        order.fee = placeOrderResponse.data.fee;

        return await this.orderRepository.save(order);
    }

    async executed(order: Order, placeOrderResponse: PlaceOrderResponse) {
        order.status = OrderStatus.EXECUTED;
        order.executedAt = placeOrderResponse.data.timestamp;

        return await this.orderRepository.save(order);
    }

    async failed(order: Order, reason: string) {
        order.status = OrderStatus.FAILED;
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

        const result: PlaceOrderResponse = await marketDataManager.placeOrder(
            strategy.id,
            order
        );

        if (result.status === PlaceOrderStatus.SUCCESS) {
            await this.canceled(order);
        } else {
            logger.error(`Failed to cancel order ${order.id}`, result);
        }
    }
}

export const orderService = new OrderService();
