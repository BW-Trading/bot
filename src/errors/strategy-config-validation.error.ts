import { ValidationError } from "class-validator";
import { CustomError } from "./custom-error";
import { HttpStatusCode } from "./httpStatusCodeEnum";

export class StrategyConfigValidationError extends CustomError {
    constructor(errorList: ValidationError[]) {
        super(
            "Invalid configuration format.",
            HttpStatusCode.BAD_REQUEST,
            "INVALID_INPUT",
            {
                errors: errorList,
            }
        );
    }
}
