import { Router } from "express";
import { StrategyController } from "../controllers/strategy.controller";
import { validateDto } from "../dto/validate-dto";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { ValidationType } from "../dto/validation-type";
import { RunStrategyDto } from "../dto/requests/strategy/run.dto";
import { GetStrategyOrdersDto } from "../dto/requests/strategy/get-orders.dto";
import { GetStrategyByIdDto } from "../dto/requests/strategy/get-by-id.dto";
import { RunStrategyOnceDto } from "../dto/requests/strategy/run-once.dto";
import { ArchiveStrategyDto } from "../dto/requests/strategy/archive.dto";
import { StopStrategyDto } from "../dto/requests/strategy/stop.dto";
import { GetStrategyByIdPortfolioDto } from "../dto/requests/strategy/get-by-id-portfolio.dto";
import { isAuthenticated } from "../middlewares/is-authenticated";
import { CreatedStrategyDto } from "../dto/requests/strategy/created.dto";
import { GetStrategyExecutionDto } from "../dto/requests/strategy/get-executions.dto";

const strategyRouter = Router();

strategyRouter.use(isAuthenticated);

strategyRouter.get("/runnable", StrategyController.getRunnableStrategies);

strategyRouter.get(
    "/created",
    validateDto(CreatedStrategyDto, ValidationType.QUERY),
    StrategyController.getStrategies
);

strategyRouter.post(
    "/",
    validateDto(CreateStrategyDto, ValidationType.BODY),
    StrategyController.createStrategy
);

strategyRouter.post(
    "/:id/run",
    validateDto(RunStrategyDto, ValidationType.PARAMS),
    StrategyController.runStrategy
);

strategyRouter.post(
    "/:id/run-once",
    validateDto(RunStrategyOnceDto, ValidationType.PARAMS),
    StrategyController.runOnce
);

strategyRouter.get("/running", StrategyController.getRunningStrategies);

// strategyRouter.get(
//     "/:id/orders",
//     validateDto(GetStrategyOrdersDto, ValidationType.PARAMS),
//     StrategyController.getOrders
// );

// strategyRouter.get(
//     "/:id/executions",
//     validateDto(GetStrategyExecutionDto, ValidationType.PARAMS),
//     StrategyController.getExecutions
// );

strategyRouter.get(
    "/:id",
    validateDto(GetStrategyByIdDto, ValidationType.PARAMS),
    StrategyController.getStrategy
);

// strategyRouter.post(
//     "/add-balance",
//     validateDto(RunStrategyDto, ValidationType.BODY),
//     StrategyController.addBalance
// );

strategyRouter.put(
    "/:id/archive",
    validateDto(ArchiveStrategyDto, ValidationType.PARAMS),
    StrategyController.archiveStrategy
);

strategyRouter.post(
    "/:id/stop",
    validateDto(StopStrategyDto, ValidationType.PARAMS),
    StrategyController.stopStrategy
);

// strategyRouter.get(
//     "/:id/portfolio",
//     validateDto(GetStrategyByIdPortfolioDto, ValidationType.PARAMS),
//     StrategyController.getPortfolio
// );

export default strategyRouter;
