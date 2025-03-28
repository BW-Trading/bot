import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { Strategy } from "./strategy.entity";
import { Order } from "./order.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";

@Entity()
export class Position {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Strategy, (strategy) => strategy.position)
    @JoinColumn()
    strategy!: Strategy;

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
