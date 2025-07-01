import { DataSource } from "typeorm";
import { join } from "path";
import DatabaseManager from "./services/database-manager.service";
import "dotenv/config";

export async function createTestDataSource(): Promise<DataSource> {
    const testDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        dropSchema: true,
        synchronize: true,
        logging: false,
        entities: [join(__dirname, "entities", "*.entity.{ts,js}")],
    });

    await testDataSource.initialize();
    jest.spyOn(DatabaseManager, "getAppDataSource").mockReturnValue(
        testDataSource
    );
    return testDataSource;
}
