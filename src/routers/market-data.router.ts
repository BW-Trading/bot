import { Router } from "express";
import { MarketDataController } from "../controllers/market-data.controller";
import { validateDto } from "../dto/validate-dto";
import { ValidationType } from "../dto/validation-type";
import { OrderBookDto } from "../dto/requests/market-data/order-book.dto";
import { TickerPriceDto } from "../dto/requests/market-data/ticker-price.dto";
import { HistoryChartDto } from "../dto/requests/market-data/history-chart.dto";
import { HistoryDto } from "../dto/requests/market-data/history.dto";

const marketDataRouter = Router();

marketDataRouter.get(
    "/ticker-price",
    validateDto(TickerPriceDto, ValidationType.QUERY),
    MarketDataController.getTickerPrice
);
marketDataRouter.get(
    "/order-book",
    validateDto(OrderBookDto, ValidationType.QUERY),
    MarketDataController.getOrderBook
);
marketDataRouter.get(
    "/history",
    validateDto(HistoryDto, ValidationType.QUERY),
    MarketDataController.getMarketHistory
);
marketDataRouter.get(
    "/history-chart",
    validateDto(HistoryChartDto, ValidationType.QUERY),
    MarketDataController.getMarketHistoryForChart
);
export default marketDataRouter;
