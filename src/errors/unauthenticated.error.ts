import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class UnauthenticatedError extends CustomError {
    constructor(
        message: string = "You must be authenticated to perform this action.",
        details?: any
    ) {
        super(
            message,
            HttpStatusCode.UNAUTHENTICATED,
            "UNAUTHENTICATED",
            details
        );
    }
}
