import { DataSource } from "typeorm";
import { appEnv } from "./utils/env/app-env";
import { join } from "path";

export const appDataSource = new DataSource({
    type: appEnv.database.type as any,
    host: appEnv.database.host,
    port: parseInt(appEnv.database.port),
    username: appEnv.database.user,
    password: appEnv.database.password,
    database: appEnv.database.name,
    synchronize: true,
    logging: false,
    entities: [join(__dirname, "entities", "*.entity.{ts,js}")],
    migrations: [join(__dirname, "migrations", "*.{ts,js}")],
});
