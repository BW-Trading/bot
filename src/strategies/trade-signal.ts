import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderSide, OrderType } from "../entities/order.entity";

export interface TradeSignal {
    action: OrderSide;
    type: OrderType;
    asset: TradeableAssetEnum;
    price?: number;
    quantity?: number;
    justification?: string;
    metadata?: Record<string, any>;
}
