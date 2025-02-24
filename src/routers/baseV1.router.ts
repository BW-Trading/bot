import { Router } from "express";
import strategyRouter from "./strategy.router";

const baseV1Router = Router();

baseV1Router.use("/strategy", strategyRouter);

export default baseV1Router;
