import { NextFunction, Request, Response } from "express";
import { orderService } from "../services/order.service";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";

class OrderController {
    async lastStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params.id)!;

            sendResponse(
                res,
                new ResponseOkDto(
                    "Order status retrieved successfully",
                    200,
                    await orderService.getUpdatedUserOrderStatus(orderId)
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

export const orderController = new OrderController();
