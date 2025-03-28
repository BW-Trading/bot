import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class WalletError extends CustomError {
    constructor(message: string, details?: any) {
        super(message, HttpStatusCode.BAD_REQUEST, "WALLET", details);
    }
}
