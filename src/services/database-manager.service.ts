import { DataSource } from "typeorm";
import { join } from "path";
import { logger } from "../loggers/logger";
import { appEnv } from "../utils/env/app-env";

class DatabaseManager {
    private static instance: DatabaseManager;

    public appDataSource: DataSource;
    private tryingToConnect = false;

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    private constructor() {
        this.appDataSource = new DataSource({
            type: appEnv.database.type as any,
            host: appEnv.database.host,
            port: parseInt(appEnv.database.port),
            username: appEnv.database.user,
            password: appEnv.database.password,
            database: appEnv.database.name,
            synchronize: false,
            logging: false,
            entities: [join(__dirname, "entities", "*.entity.{ts,js}")],
            migrations: [join(__dirname, "migrations", "*.{ts,js}")],
        });
    }

    // Main database connection
    public async connectAppDataSource(): Promise<void> {
        if (this.tryingToConnect) {
            return;
        }
        this.tryingToConnect = true;
        let connected = false;

        while (!connected) {
            try {
                await this.appDataSource.initialize();
                connected = true;
                logger.info("Connection to database OK");
            } catch (error) {
                logger.error("Error connecting to database: ", error);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
        this.tryingToConnect = false;
    }

    // Close all connections
    public async closeConnections(): Promise<void> {
        try {
            await this.appDataSource.destroy();
            logger.info("Database connections closed");
        } catch (error) {
            logger.error("Error closing database connection: ", error);
        }
    }
}

export default DatabaseManager;
