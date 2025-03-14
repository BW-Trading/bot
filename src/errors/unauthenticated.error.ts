import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class UnauthenticatedError extends CustomError {
    constructor(details?: any) {
        super(
            "You must be authenticated to perform this action.",
            HttpStatusCode.UNAUTHENTICATED,
            "UNAUTHENTICATED",
            details
        );
    }
}
