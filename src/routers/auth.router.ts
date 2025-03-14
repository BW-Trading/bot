import { Router } from "express";
import NotImplementedError from "../errors/not-implemented.error";
import { isAuthenticated } from "../middlewares/is-authenticated";
import { validateDto } from "../dto/validate-dto";
import { SignupDto } from "../dto/requests/auth/signup.dto";
import { authController } from "../controllers/auth.controller";
import { LoginDto } from "../dto/requests/auth/login.dto";

const authRouter = Router();

authRouter.post("/signup", validateDto(SignupDto), authController.signup);

authRouter.post("/login", validateDto(LoginDto), authController.login);

authRouter.get("/logout", isAuthenticated, authController.logout);

authRouter.get("/forgot-password", (req, res) => {
    throw new NotImplementedError();
});

authRouter.get("/reset-password", (req, res) => {
    throw new NotImplementedError();
});

export default authRouter;
