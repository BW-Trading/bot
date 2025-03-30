import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { strategyService } from "../services/strategy.service";
import {
    Strategy,
    StrategyInstanceStatusEnum,
} from "../entities/strategy.entity";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { plainToInstance } from "class-transformer";
import { StrategyManagerService } from "../services/strategy-manager.service";
import { AddBalanceStrategyDto } from "../dto/requests/strategy/add-balance.dto";
import { RunStrategyOnceDto } from "../dto/requests/strategy/run-once.dto";
import { RunStrategyDto } from "../dto/requests/strategy/run.dto";
import { StrategyNotActiveError } from "../errors/strategy-not-active.error";
import { ArchiveStrategyDto } from "../dto/requests/strategy/archive.dto";
import { GetStrategyByIdDto } from "../dto/requests/strategy/get-by-id.dto";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { CreatedStrategyDto } from "../dto/requests/strategy/created.dto";
import { GetStrategyExecutionDto } from "../dto/requests/strategy/get-executions.dto";
import { strategyExecutionService } from "../services/strategy-execution.service";
import { StrategySchedulerService } from "../services/strategy-scheduler.service";

export class StrategyController {
    static getRunnableStrategies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const strategies = strategyService.getExistingImplementations();
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

    static async getStrategy(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(GetStrategyByIdDto, req.params);
            const strategy = await strategyService.getUserStrategyByIdOrThrow(
                dto.id
            );
            sendResponse(
                res,
                new ResponseOkDto<Strategy>("Strategy retrieved", 200, strategy)
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
            const dto: CreatedStrategyDto = plainToInstance(
                CreatedStrategyDto,
                req.query
            );

            const strategies = await strategyService.getUserStrategies(
                dto.isActive,
                StrategyInstanceStatusEnum.STOPPED
            );

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
            if (!req.session.user) {
                throw new UnauthenticatedError();
            }

            const dto: CreateStrategyDto = plainToInstance(
                CreateStrategyDto,
                req.body
            );

            const strategy = await strategyService.createStrategy(
                dto.name,
                dto.description,
                dto.asset,
                dto.strategyType,
                dto.config,
                dto.interval,
                dto.marketDataAccountId
            );

            sendResponse(
                res,
                new ResponseOkDto<Strategy>("Strategy created", 201, strategy)
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Schedules the strategy to run at the given interval.
     */
    static async runStrategy(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(RunStrategyDto, req.params);

            const strategy = await strategyService.getUserStrategyByIdOrThrow(
                dto.id
            );

            StrategySchedulerService.getInstance().scheduleStrategy(
                strategy.id,
                strategy.executionInterval
            );

            sendResponse(res, new ResponseOkDto("Strategy started", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Executes the strategy once. No scheduling is done.
     */
    static async runOnce(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(RunStrategyOnceDto, req.params);
            const strategy = await strategyService.getUserStrategyByIdOrThrow(
                dto.id
            );

            StrategyManagerService.getInstance().executeStrategy(
                strategy.id,
                false
            );
            sendResponse(res, new ResponseOkDto("Strategy executed", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Returns all running strategies for the user :
     * active = true and status = StrategyInstanceStatusEnum.ACTIVE
     */
    static async getRunningStrategies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const runningStrategies = strategyService.getUserStrategies(
                true,
                StrategyInstanceStatusEnum.ACTIVE
            );

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

    // static async getOrders(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         if (!req.session.user) {
    //             throw new UnauthenticatedError();
    //         }

    //         const id = parseInt(req.params.id);
    //         const openOrders =
    //             await marketActionService.getMarketActionsForUserStrategy(
    //                 req.session.user.user.id,
    //                 id,
    //                 [
    //                     MarketActionStatusEnum.OPEN,
    //                     MarketActionStatusEnum.CLOSED,
    //                     MarketActionStatusEnum.CANCELLED,
    //                     MarketActionStatusEnum.PENDING,
    //                 ]
    //             );

    //         sendResponse(
    //             res,
    //             new ResponseOkDto("Orders retrieved", 200, openOrders)
    //         );
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // static async getPortfolio(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         if (!req.session.user) {
    //             throw new UnauthenticatedError();
    //         }

    //         const id = parseInt(req.params.id);
    //         const portfolio = await strategyService.getPortfolioForUserStrategy(
    //             req.session.user.user.id,
    //             id
    //         );
    //         sendResponse(
    //             res,
    //             new ResponseOkDto("Portfolio retrieved", 200, portfolio)
    //         );
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // static async addBalance(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         if (!req.session.user) {
    //             throw new UnauthenticatedError();
    //         }

    //         const dto: AddBalanceStrategyDto = plainToInstance(
    //             AddBalanceStrategyDto,
    //             req.body
    //         );

    //         const portfolio = await strategyService.addBalance(
    //             req.session.user.user.id,
    //             dto.id,
    //             dto.amount
    //         );

    //         sendResponse(
    //             res,
    //             new ResponseOkDto<Portfolio>("Balance added", 200, portfolio)
    //         );
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // static async stopStrategy(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         if (!req.session.user) {
    //             throw new UnauthenticatedError();
    //         }

    //         const dto = plainToInstance(RunStrategyDto, req.params);
    //         const strategy = await strategyService.getUserStrategyByIdOrThrow(
    //             req.session.user.user.id,
    //             dto.id
    //         );
    //         StrategyManagerService.getInstance().stopStrategy(strategy.id);
    //         sendResponse(res, new ResponseOkDto("Strategy stopped", 200));
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    static async archiveStrategy(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const dto = plainToInstance(ArchiveStrategyDto, req.params);

            const strategy = await strategyService.getUserStrategyByIdOrThrow(
                dto.id
            );

            const result = await strategyService.archive(strategy);

            sendResponse(
                res,
                new ResponseOkDto<Strategy>("Strategy archived", 200, result)
            );
        } catch (error) {
            next(error);
        }
    }

    // static async getExecutions(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ) {
    //     try {
    //         if (!req.session.user) {
    //             throw new UnauthenticatedError();
    //         }

    //         const dto = plainToInstance(GetStrategyExecutionDto, req.params);
    //         const executions =
    //             await strategyExecutionService.getUserStrategyExecutions(
    //                 req.session.user.user.id,
    //                 dto.id
    //             );

    //         sendResponse(
    //             res,
    //             new ResponseOkDto("Executions retrieved", 200, executions)
    //         );
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}
