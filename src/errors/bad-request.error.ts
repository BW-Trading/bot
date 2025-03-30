import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
    constructor(message: string, details?: any) {
        super(message, 400, "BAD_REQUEST", details);
    }
}
