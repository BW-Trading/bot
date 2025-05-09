import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
import { Order } from "./order.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";
import { MarketDataAccount } from "./market-data-account.entity";

@Entity()
export class Position {
    @PrimaryGeneratedColumn()
    id!: number;

    // Position associated to a specific market data account
    @ManyToOne(
        () => MarketDataAccount,
        (marketDataAccount) => marketDataAccount.positions
    )
    marketDataAccount!: MarketDataAccount;

    @Column({ type: "enum", enum: TradeableAssetEnum })
    asset!: TradeableAssetEnum;

    /**
     * The total quantity of the asset held in this position.
     */
    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    totalQuantity!: number;

    /**
     * The average price at which the asset was bought or sold.
     */
    @Column("decimal", { precision: 18, scale: 8, nullable: true })
    averageEntryPrice?: number;

    /**
     * The total realized profit or loss from this position.
     */
    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    realizedPnL!: number;

    @OneToMany(() => Order, (order) => order.position)
    orders!: Order[];

    @CreateDateColumn()
    createdAt!: Date;
}
