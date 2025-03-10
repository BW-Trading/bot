import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/send-response";
import { ResponseOkDto } from "../dto/responses/response-ok.dto";
import { User } from "../entities/user.entity";
import { authService } from "../services/auth.service";
import { plainToInstance } from "class-transformer";
import { LoginDto } from "../dto/requests/auth/login.dto";
import { SignupDto } from "../dto/requests/auth/signup.dto";
import { appEnv } from "../utils/env/app-env";

declare module "express-session" {
    interface SessionData {
        user: { user: User; token: string };
    }
}

class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(LoginDto, req.body);
            const { user, token } = await authService.loginUsernamePassword(
                dto.username,
                dto.password
            );

            req.session.user = { user, token };

            res.cookie("authToken", token, {
                httpOnly: appEnv.cookies.httpOnly,
                secure: appEnv.cookies.secured,
                expires: new Date(Date.now() + appEnv.cookies.maxAge),
            });

            const responseDto = new ResponseOkDto("Login successful", 200, {
                username: user.username,
            });
            sendResponse(res, responseDto);
        } catch (error) {
            next(error);
        }
    }

    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = plainToInstance(SignupDto, req.body);
            const user = await authService.signup(dto.username, dto.password);

            const responseDto = new ResponseOkDto(
                `User ${req.body.username} created successfully`,
                201,
                {
                    id: user.id,
                    username: user.username,
                    createdAt: user.createdAt,
                }
            );

            sendResponse(res, responseDto);
        } catch (error) {
            next(error);
        }
    }

    logout(req: Request, res: Response, next: NextFunction) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    throw err;
                }
                res.clearCookie("authToken");
                const responseDto = new ResponseOkDto("Logout successful");
                sendResponse(res, responseDto);
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
