import { getEnvVariable, getOptionalEnvVariable } from "./env-loading";

export const appEnv = {
    app: {
        name: getEnvVariable<string>("APP_NAME", "string"),
        version: getEnvVariable<string>("APP_VERSION", "string"),
        domain: getEnvVariable<string>("APP_DOMAIN", "string"),
    },
    server: {
        baseRouterUrlV1: getEnvVariable<string>("BASE_ROUTER_URL_V1", "string"),
        port: getOptionalEnvVariable<Number>("PORT", "number") || 3000,
        env:
            getOptionalEnvVariable<string>("NODE_ENV", "string") ||
            "development",
    },
    auth: {
        ignoreAuth:
            getOptionalEnvVariable<boolean>("IGNORE_AUTH", "boolean") || false,
        jwtSecret: getEnvVariable<string>("JWT_SECRET", "string"),
        jwtExpiresIn: getEnvVariable<string>("JWT_EXPIRES", "string"),
    },
    cookies: {
        secured: getEnvVariable<boolean>("COOKIES_SECURED", "boolean"),
        httpOnly: getEnvVariable<boolean>("COOKIES_HTTP_ONLY", "boolean"),
        maxAge: getEnvVariable<number>("COOKIES_MAX_AGE", "number"),
    },
    session: {
        secret: getEnvVariable<string>("SESSION_SECRET", "string"),
        
    },
    cors: {
        origin: getEnvVariable<string>("CORS_ORIGIN", "string"),
    },
    logs: {
        console_logs:
            getOptionalEnvVariable<boolean>("LOG_CONSOLE", "boolean") || false,
        logs_path: getEnvVariable<string>("LOGS_PATH", "string"),
    },
    database: {
        host: getEnvVariable<string>("DATABASE_HOST", "string"),
        port: getEnvVariable<string>("DATABASE_PORT", "string"),
        name: getEnvVariable<string>("DATABASE_NAME", "string"),
        user: getEnvVariable<string>("DATABASE_USER", "string"),
        password: getEnvVariable<string>("DATABASE_PASSWORD", "string"),
        type: getEnvVariable<string>("DATABASE_TYPE", "string"),
    },
};
