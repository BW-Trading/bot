import { Router } from "express";
import { MarketDataController } from "../controllers/marketData.controller";
import { validateDto } from "../dto/validate-dto";
import { TickerPriceDto } from "../dto/requests/tickerprice.dto";
import { MarketHistoryDto } from "../dto/requests/markethistory";
import { ValidationType } from "../dto/validation-type";

const marketDataRouter = Router();

marketDataRouter.get(
    "/ticker-price",
    validateDto(TickerPriceDto, ValidationType.QUERY),
    MarketDataController.getTickerPrice
);
marketDataRouter.get(
    "/order-book",
    validateDto(TickerPriceDto, ValidationType.QUERY),
    MarketDataController.getOrderBook
);
marketDataRouter.get(
    "/history",
    validateDto(MarketHistoryDto, ValidationType.BODY),
    MarketDataController.getMarketHistory
);
marketDataRouter.get(
    "/history-chart",
    validateDto(MarketHistoryDto, ValidationType.QUERY),
    MarketDataController.getMarketHistoryForChart
);
export default marketDataRouter;
