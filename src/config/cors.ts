import cors from "cors";

export const corsConfig = cors({
    credentials: true,
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
    ],
});
