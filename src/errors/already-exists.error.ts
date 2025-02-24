import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class AlreadyExistsError extends CustomError {
    constructor(message: string = "Already exists") {
        super(message, HttpStatusCode.NOT_FOUND, "ALREADY_EXISTS");
    }
}
