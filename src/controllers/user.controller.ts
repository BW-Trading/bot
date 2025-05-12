import { NextFunction, Request, Response } from "express";
import { marketDataAccountService } from "../services/market-data-account.service";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { plainToInstance } from "class-transformer";
import { CreateMarketDataAccountDto } from "../dto/requests/user/create-market-data-account.dto";

class UserController {
    async createMarketDataAccount(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { apiKey, exchange } = plainToInstance(
            CreateMarketDataAccountDto,
            req.body
        );
        try {
            const account =
                await marketDataAccountService.createMarketDataAccount(
                    exchange,
                    apiKey
                );

            sendResponse(
                res,
                new ResponseOkDto(
                    "Market data account created successfully",
                    201,
                    account
                )
            );
        } catch (error) {
            next(error);
        }
    }

    async getMarketDataAccounts(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const accounts =
                await marketDataAccountService.getMarketDataAccounts();
            sendResponse(
                res,
                new ResponseOkDto(
                    "Market data accounts retrieved",
                    200,
                    accounts
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
