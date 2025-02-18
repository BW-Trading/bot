import { Request, Response, NextFunction, Router } from "express";
import { RecupDataService } from "../services/recup_data.service";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";

const recupDataService = new RecupDataService();
const RecupDataRouter = Router();

/**
 * Récupérer le prix actuel d'une paire de trading
 * existe aussi la websocket pour avoir les maj en temps réel
 */
RecupDataRouter.get(
    "/ticker_price",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const symbol = req.query.symbol as string;
            const tickerPrice = await recupDataService.getTickerPrice(symbol);
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
);

/**
 * Récupérer l'order book d'une paire de trading
 * (peux changer la route pour avoir une solution optimisée avec un url websocket de binance pour avoir les maj dès qu'elles se produisent)
 */
RecupDataRouter.get(
    "/order_book",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const symbol = req.query.symbol as string;
            const limit = parseInt(req.query.limit as string) || 5;
            const orderBook = await recupDataService.getOrderBook(
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
);

/**
 * Récupérer l'historique des prix du marché (bougies)
 * websocket existante mais seulement pour avoir les bougies en formation
 */
RecupDataRouter.get(
    "/market_history",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const symbol = req.query.symbol as string;
            const interval = (req.query.interval as string) || "1d"; // 1 jour par défaut
            const limit = parseInt(req.query.limit as string) || 100; // 100 bougies par défaut

            const marketHistory = await recupDataService.getMarketHistory(
                symbol,
                interval,
                limit
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
);

export default RecupDataRouter;
