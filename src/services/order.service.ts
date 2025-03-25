import { Order } from "../entities/order.entity";
import { Strategy } from "../entities/strategy.entity";
import { TradeSignal } from "../strategies/trade-signal";
import { marketDataManager } from "./market-data/market-data-manager";
import { positionService } from "./position.service";
import { strategyService } from "./strategy.service";

class OrderService {
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
    }

    async placeOrders(strategyId: number, tradeSignals: TradeSignal[]) {
        for (const tradeSignal of tradeSignals) {
            await this.placeOrder(strategyId, tradeSignal);
        }
    }

    async placeOrder(strategyId: number, tradeSignal: TradeSignal) {
        const strategy = await strategyService.getByIdOrThrow(strategyId);

        // Place an order
        const order = await this.createOrder(strategy, tradeSignal);
        const orderResponse = await marketDataManager.placeOrder(
            strategy.id,
            order
        );
    }
}

export const orderService = new OrderService();
