import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Strategy } from "./strategy.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";
import { Position } from "./position.entity";

export enum OrderType {
    MARKET = "market",
    LIMIT = "limit",
    STOP_LOSS = "stop_loss",
    TAKE_PROFIT = "take_profit",
}

export enum OrderStatus {
    PENDING = "pending",
    EXECUTED = "executed",
    CANCELED = "canceled",
}

export enum OrderSide {
    BUY = "buy",
    SELL = "sell",
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Strategy, (strategy) => strategy.orders)
    strategy!: Strategy;

    @Column({ type: "enum", enum: OrderSide })
    side!: OrderSide;

    @Column({ type: "enum", enum: OrderType })
    type!: OrderType;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @Column()
    asset!: TradeableAssetEnum;

    @Column("decimal", { precision: 18, scale: 8, nullable: true })
    quantity?: number;

    @Column("decimal", { precision: 18, scale: 8, nullable: true })
    price?: number;

    @ManyToOne(() => Position, (position) => position.orders, {
        nullable: true,
    })
    position?: Position;

    @Column({ nullable: true })
    exchangeId?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    executedAt?: Date;
}
