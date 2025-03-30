import { Router } from "express";
import { validateDto } from "../dto/validate-dto";
import { CreateMarketDataAccountDto } from "../dto/requests/user/create-market-data-account.dto";
import { ValidationType } from "../dto/validation-type";
import { isAuthenticated } from "../middlewares/is-authenticated";
import { userController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.use(isAuthenticated);

userRouter.get("/market-data-account", userController.getMarketDataAccounts);

userRouter.post(
    "/market-data-account",
    validateDto(CreateMarketDataAccountDto, ValidationType.BODY),
    userController.createMarketDataAccount
);

export default userRouter;
