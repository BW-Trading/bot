import { Request, Response, NextFunction } from "express";
import { MarketDataService } from "../services/MarketDataService";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { plainToInstance } from "class-transformer";
import { TickerPriceDto } from "../dto/requests/market-data/ticker-price.dto";
import { OrderBookDto } from "../dto/requests/market-data/order-book.dto";
import { HistoryDto } from "../dto/requests/market-data/history.dto";
import { HistoryChartDto } from "../dto/requests/market-data/history-chart.dto";

const marketDataService = new MarketDataService();

export class MarketDataController {
    /**
     * Récupérer le prix actuel d'une paire de trading
     */
    static async getTickerPrice(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const dto = plainToInstance(TickerPriceDto, req.query);
            const tickerPrice = await marketDataService.getTickerPrice(
                dto.symbol,
                dto.symbols
            );

            sendResponse(
                res,
                new ResponseOkDto(
                    "Ticker price retrieved successfully",
                    200,
                    tickerPrice
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer l'order book d'une paire de trading
     */
    static async getOrderBook(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(OrderBookDto, req.query);

            const orderBook = await marketDataService.getOrderBook(
                dto.symbol,
                dto.limit
            );

            sendResponse(
                res,
                new ResponseOkDto(
                    "Order book retrieved successfully",
                    200,
                    orderBook
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer l'historique des prix du marché (bougies)
     */
    static async getMarketHistory(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const dto = plainToInstance(HistoryDto, req.query);
            const marketHistory = await marketDataService.getMarketHistory(
                dto.symbol,
                dto.interval,
                dto.limit,
                dto.startTime,
                dto.endTime,
                dto.timeZone
            );

            sendResponse(
                res,
                new ResponseOkDto(
                    "Market history retrieved successfully",
                    200,
                    marketHistory
                )
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer l'historique des prix du marché (bougies) adapté pour les graphiques
     */
    static async getMarketHistoryForChart(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const dto = plainToInstance(HistoryChartDto, req.query);
            const marketHistory = await marketDataService.getMarketHistory(
                dto.symbol,
                dto.interval,
                dto.limit,
                dto.startTime,
                dto.endTime,
                dto.timeZone
            );

            sendResponse(
                res,
                new ResponseOkDto(
                    "Market history retrieved successfully",
                    200,
                    marketHistory
                )
            );
        } catch (error) {
            next(error);
        }
    }
}
