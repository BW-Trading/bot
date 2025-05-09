import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class AlreadyExistsError extends CustomError {
    constructor(message: string = "Already exists", details?: any) {
        super(message, HttpStatusCode.NOT_FOUND, "ALREADY_EXISTS", details);
    }
}
