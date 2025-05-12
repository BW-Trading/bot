import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { isAuthenticated } from "../middlewares/is-authenticated";

const orderRouter = Router();

orderRouter.use(isAuthenticated);

orderRouter.get("/status/:id", orderController.lastStatus);

export default orderRouter;
