import { Router } from "express";
import strategyRouter from "./strategy.router";
import MarketDataRouter from "./marketData.router";

const baseV1Router = Router();

baseV1Router.use("/strategy", strategyRouter);

baseV1Router.use("/recup-data", MarketDataRouter);

export default baseV1Router;
