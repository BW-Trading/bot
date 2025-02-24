import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { strategyService } from "../services/strategy.service";
import { Strategy } from "../entities/strategy.entity";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { plainToInstance } from "class-transformer";

export class StrategyController {
    static async getStrategies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const strategies = await strategyService.getStrategies();
            sendResponse(
                res,
                new ResponseOkDto<Strategy>(
                    "Strategies retrieved",
                    200,
                    strategies
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async createStrategy(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const dto: CreateStrategyDto = plainToInstance(
                CreateStrategyDto,
                req.body
            );

            const strategy = await strategyService.createStrategy(
                dto.name,
                dto.description,
                dto.strategyEnum,
                dto.config,
                dto.interval
            );

            sendResponse(
                res,
                new ResponseOkDto<Strategy>("Strategy created", 201, strategy)
            );
        } catch (error) {
            next(error);
        }
    }
}
