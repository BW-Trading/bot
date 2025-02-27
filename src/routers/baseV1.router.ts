import { Router } from "express";
import strategyRouter from "./strategy.router";
import MarketDataRouter from "./market-data.router";

const baseV1Router = Router();

baseV1Router.use("/strategy", strategyRouter);

baseV1Router.use("/market-data", MarketDataRouter);

export default baseV1Router;
