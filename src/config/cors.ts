import cors from "cors";
import { appEnv } from "../utils/env/app-env";

export const corsConfig = cors({
    origin: appEnv.cors.origin,
    credentials: true,
});
