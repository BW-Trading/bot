import { Request, Response, NextFunction } from "express";
import { MarketDataService } from "../services/MarketDataService";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";

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
            const symbol = req.query.symbol as string;
            const symbols = req.query.symbols as string[];
            const tickerPrice = await marketDataService.getTickerPrice(
                symbol,
                symbols
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
            const symbol = req.query.symbol as string;
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined;
            const orderBook = await marketDataService.getOrderBook(
                symbol,
                limit
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
            const symbol = req.query.symbol as string;
            const interval = (req.query.interval as string) || "1d";
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined;
            const startTime = req.query.startTime
                ? parseInt(req.query.startTime as string)
                : undefined;
            const endTime = req.query.endTime
                ? parseInt(req.query.endTime as string)
                : undefined;
            const timeZone =
                typeof req.query.timeZone === "string"
                    ? req.query.timeZone
                    : undefined;
            const marketHistory = await marketDataService.getMarketHistory(
                symbol,
                interval,
                limit,
                startTime,
                endTime,
                timeZone
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
            const symbol = req.query.symbol as string;
            const interval = (req.query.interval as string) || "1d";
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined;
            const startTime = req.query.startTime
                ? parseInt(req.query.startTime as string)
                : undefined;
            const endTime = req.query.endTime
                ? parseInt(req.query.endTime as string)
                : undefined;
            const timeZone =
                typeof req.query.timeZone === "string"
                    ? req.query.timeZone
                    : undefined;
            const marketHistory = await marketDataService.getMarketHistory(
                symbol,
                interval,
                limit,
                startTime,
                endTime,
                timeZone
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
