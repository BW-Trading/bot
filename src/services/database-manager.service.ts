import { DataSource } from "typeorm";
import { logger } from "../loggers/logger";
import { appDataSource } from "../data-source";

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

    public static getAppDataSource(): DataSource {
        return DatabaseManager.getInstance().appDataSource;
    }

    private constructor() {
        this.appDataSource = appDataSource;
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
