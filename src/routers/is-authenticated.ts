import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { appEnv } from "../utils/env/app-env";

export function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (appEnv.auth.ignoreAuth) {
        return next();
    }

    const token = req.cookies.authToken;
    const sessionUser = req.session.user;

    if (!token || !sessionUser || sessionUser.token !== token) {
        throw new UnauthenticatedError();
    }

    try {
        authService.isValidJwt(token);
        next();
    } catch (error) {
        next(error);
    }
}
