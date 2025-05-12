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
import { DecimalTransformer } from "../utils/decimal-transformer";
import { OrderSide } from "../services/market-data/market-data";

export enum OrderType {
    LIMIT = "limit",
    STOP_LOSS = "stop_loss",
    TAKE_PROFIT = "take_profit",
}

export enum OrderStatus {
    CREATED = "created",
    PENDING = "pending",
    FILLED = "filled",
    PARTIALLY_FILLED = "partially_filled",
    CANCELED = "canceled",
    REJECTED = "rejected",
    EXPIRED = "expired",
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

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.CREATED })
    status!: OrderStatus;

    @Column()
    asset!: TradeableAssetEnum;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        transformer: DecimalTransformer,
    })
    quantity!: number;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        nullable: true,
        transformer: DecimalTransformer,
    })
    filledQuantity!: number;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        nullable: true,
        transformer: DecimalTransformer,
    })
    price!: number;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        nullable: true,
        transformer: DecimalTransformer,
    })
    fee?: number;

    @Column({ nullable: true })
    orderId?: string;

    @ManyToOne(() => Position, (position) => position.orders, {
        nullable: true,
    })
    position?: Position;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    executedAt?: Date;

    @Column({ nullable: true })
    canceledAt?: Date;

    @Column({ nullable: true })
    failReason?: string;
}
