import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class MarketActionError extends CustomError {
    constructor(reason: string, details?: any) {
        super(reason, HttpStatusCode.INTERNAL_SERVER, "MARKET_ACTION", {
            ...details,
        });
    }
}
