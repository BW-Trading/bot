import { Router } from "express";
import { StrategyController } from "../controllers/strategy.controller";
import { validateDto } from "../dto/validate-dto";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { ValidationType } from "../dto/validation-type";
import { RunStrategyDto } from "../dto/requests/strategy/run.dto";
import { GetStrategyOrdersDto } from "../dto/requests/strategy/get-orders.dto";
import { GetStrategyByIdDto } from "../dto/requests/strategy/get-by-id.dto";

const strategyRouter = Router();

strategyRouter.get("/runnable", StrategyController.getRunnableStrategies);

strategyRouter.get("/created", StrategyController.getStrategies);

strategyRouter.post(
    "/",
    validateDto(CreateStrategyDto, ValidationType.BODY),
    StrategyController.createStrategy
);

strategyRouter.post(
    "/run/:id",
    validateDto(RunStrategyDto, ValidationType.PARAMS),
    StrategyController.runStrategy
);

strategyRouter.get("/running", StrategyController.getRunningStrategies);

strategyRouter.get(
    "/orders/:id",
    validateDto(GetStrategyOrdersDto, ValidationType.PARAMS),
    StrategyController.getOrders
);

strategyRouter.get(
    "/:id",
    validateDto(GetStrategyByIdDto, ValidationType.PARAMS),
    StrategyController.getStrategy
);

export default strategyRouter;
