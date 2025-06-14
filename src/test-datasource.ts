import { DataSource } from "typeorm";
import DatabaseManager from "./services/database-manager.service";
import "dotenv/config";
import { MarketDataAccount } from "./entities/market-data-account.entity";
import { Order } from "./entities/order.entity";
import { Position } from "./entities/position.entity";
import { StrategyExecution } from "./entities/strategy-execution.entity";
import { Strategy } from "./entities/strategy.entity";
import { User } from "./entities/user.entity";
import { Wallet } from "./entities/wallet.entity";
import { TradeLog } from "./entities/trade-log.entity";

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
        entities: [
            User,
            MarketDataAccount,
            Strategy,
            Order,
            Position,
            Wallet,
            StrategyExecution,
            MarketDataAccount,
            TradeLog,
        ],
    });

    await testDataSource.initialize();
    jest.spyOn(DatabaseManager, "getAppDataSource").mockReturnValue(
        testDataSource
    );
    return testDataSource;
}
