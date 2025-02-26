import { Router } from "express";
import { MarketDataController } from "../controllers/marketData.controller";
import { validateDto } from "../dto/validate-dto";
import { TickerPriceDto } from "../dto/requests/tickerprice.dto";
import { MarketHistoryDto } from "../dto/requests/markethistory";

const RecupDataRouter = Router();

RecupDataRouter.get(
    "/ticker-price",
    validateDto(TickerPriceDto),
    MarketDataController.getTickerPrice
);
RecupDataRouter.get(
    "/order-book",
    validateDto(TickerPriceDto),
    MarketDataController.getOrderBook
);
RecupDataRouter.get(
    "/market-history",
    validateDto(MarketHistoryDto),
    MarketDataController.getMarketHistory
);
RecupDataRouter.get(
    "/market-history-chart",
    validateDto(MarketHistoryDto),
    MarketDataController.getMarketHistoryForChart
);
export default RecupDataRouter;
