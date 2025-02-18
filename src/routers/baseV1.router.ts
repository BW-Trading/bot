import { Router } from "express";
import exampleRouter from "./example.router";
import RecupDataRouter from "../controllers/recup_data.controller";

const baseV1Router = Router();

baseV1Router.use("/example", exampleRouter);

baseV1Router.use("/recup_data", RecupDataRouter);

export default baseV1Router;
