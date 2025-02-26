import { Router } from "express";
import { MarketDataController } from "../controllers/marketData.controller";
import { validateDto } from "../dto/validate-dto";
import { TickerPriceDto } from "../dto/requests/tickerprice.dto";
import { MarketHistoryDto } from "../dto/requests/markethistory";
import { ValidationType } from "../dto/validation-type";

const RecupDataRouter = Router();

RecupDataRouter.get(
    "/ticker-price",
    validateDto(TickerPriceDto, ValidationType.QUERY),
    MarketDataController.getTickerPrice
);
RecupDataRouter.get(
    "/order-book",
    validateDto(TickerPriceDto, ValidationType.QUERY),
    MarketDataController.getOrderBook
);
RecupDataRouter.get(
    "/market-history",
    validateDto(MarketHistoryDto, ValidationType.QUERY),
    MarketDataController.getMarketHistory
);
RecupDataRouter.get(
    "/market-history-chart",
    validateDto(MarketHistoryDto, ValidationType.QUERY),
    MarketDataController.getMarketHistoryForChart
);
export default RecupDataRouter;
