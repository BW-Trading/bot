import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";

export enum TradeAction {
    BUY = "BUY",
    SELL = "SELL",
    HOLD = "HOLD",
    CLOSE_POSITION = "CLOSE_POSITION",
}

export interface TradeSignal {
    action: TradeAction;
    asset: TradeableAssetEnum;
    price?: number;
    quantity?: number;
    justification?: string;
    metadata?: Record<string, any>;
}
