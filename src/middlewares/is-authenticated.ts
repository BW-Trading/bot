import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { appEnv } from "../utils/env/app-env";
import { setUserContext } from "../entities/user.entity";

export function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (appEnv.auth.ignoreAuth) {
        return next();
    }

    if (!req.session) {
        throw new UnauthenticatedError();
    }

    const token = req.cookies.authToken;
    const sessionUser = req.session.user;

    if (!token || !sessionUser || sessionUser.token !== token) {
        throw new UnauthenticatedError();
    }

    try {
        authService.isValidJwt(token);
        setUserContext(sessionUser.user.id, next);
    } catch (error) {
        next(error);
    }
}
