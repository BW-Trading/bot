import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
} from "typeorm";
import { Strategy } from "./strategy.entity";
import { Order } from "./order.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";

@Entity()
export class Position {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Strategy, (strategy) => strategy.positions)
    strategy!: Strategy;

    @Column({ type: "enum", enum: TradeableAssetEnum })
    asset!: TradeableAssetEnum;

    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    totalQuantity!: number;

    @Column("decimal", { precision: 18, scale: 8, nullable: true })
    averageEntryPrice?: number;

    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    realizedPnL!: number;

    @OneToMany(() => Order, (order) => order.position, { nullable: true })
    orders?: Order[];

    @CreateDateColumn()
    createdAt!: Date;
}
