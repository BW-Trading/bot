import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { strategyService } from "../services/strategy.service";
import { Strategy } from "../entities/strategy.entity";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { plainToInstance } from "class-transformer";
import { StrategyManagerService } from "../services/strategy-manager.service";

export class StrategyController {
    static getRunnableStrategies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const strategies = strategyService.getRunnableStrategies();
            sendResponse(
                res,
                new ResponseOkDto(
                    "Runnable strategies retrieved",
                    200,
                    strategies
                )
            );
        } catch (error) {
            next(error);
        }
    }

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

    static async runStrategy(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const strategy = await strategyService.getStrategyById(id);
            StrategyManagerService.getInstance().startStrategy(strategy);
            sendResponse(res, new ResponseOkDto("Strategy started", 200));
        } catch (error) {
            next(error);
        }
    }

    static async getRunningStrategies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const runningStrategies =
                StrategyManagerService.getInstance().getRunningStrategies();
            sendResponse(
                res,
                new ResponseOkDto(
                    "Running strategies retrieved",
                    200,
                    runningStrategies
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const orders = await strategyService.getOrdersForStrategy(id);
            sendResponse(
                res,
                new ResponseOkDto("Orders retrieved", 200, orders)
            );
        } catch (error) {
            next(error);
        }
    }
}
