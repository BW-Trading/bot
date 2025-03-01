import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class PortfolioOperationError extends CustomError {
    constructor(
        public message: string,
        public operation: string,
        public amount: number,
        public price: number
    ) {
        super(
            message,
            HttpStatusCode.BAD_REQUEST,
            "PORTFOLIO_OPERATION_ERROR",
            {
                operation,
                amount,
                price,
            }
        );
    }
}
