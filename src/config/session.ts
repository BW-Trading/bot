import session from "express-session";
import { appEnv } from "../utils/env/app-env";

export const sessionConfig = session({
    secret: appEnv.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: appEnv.cookies.httpOnly,
        secure: appEnv.cookies.secured,
        maxAge: appEnv.cookies.maxAge,
    },
});
