import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class BinanceFetchingError extends CustomError {
    constructor(
        endpoint: string,
        binanceError: string,
        binanceErrorCode: number,
        message = "Error while fetching data from Binance API"
    ) {
        super(message, HttpStatusCode.BAD_REQUEST, "BINANCE_FETCHING_ERROR", {
            endpoint,
            binanceError,
            binanceErrorCode,
        });
    }
}
