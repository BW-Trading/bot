import { Router } from "express";
import { StrategyController } from "../controllers/strategy.controller";
import { validateDto } from "../dto/validate-dto";
import { CreateStrategyDto } from "../dto/requests/strategy/create.dto";
import { ValidationType } from "../dto/validation-type";

const strategyRouter = Router();

strategyRouter.get("/created", StrategyController.getStrategies);
strategyRouter.post(
    "/",
    validateDto(CreateStrategyDto, ValidationType.BODY),
    StrategyController.createStrategy
);

export default strategyRouter;
