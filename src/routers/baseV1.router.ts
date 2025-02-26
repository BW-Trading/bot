import { Router } from "express";
import exampleRouter from "./example.router";
import MarketDataRouter from "./marketData.router";

const baseV1Router = Router();

baseV1Router.use("/example", exampleRouter);

baseV1Router.use("/recup-data", MarketDataRouter);

export default baseV1Router;
