import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { OrderType } from "../entities/order.entity";
import { OrderSide } from "../services/market-data/market-data";

export interface TradeSignal {
    action: OrderSide;
    type: OrderType;
    asset: TradeableAssetEnum;
    price: number;
    quantity: number;
    justification?: string;
    metadata?: Record<string, any>;
}
