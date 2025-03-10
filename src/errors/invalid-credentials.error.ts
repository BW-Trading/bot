import { CustomError } from "./custom-error";

export class InvalidCredentialsError extends CustomError {
    constructor(details?: any) {
        super("Invalid credentials.", 401, "INVALID_CREDENTIALS", details);
    }
}
