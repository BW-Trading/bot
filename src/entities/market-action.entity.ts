import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { MarketActionEnum } from "./enums/market-action.enum";
import { MarketActionStatusEnum } from "./enums/market-action-status.enum";
import { DecimalTransformer } from "../utils/decimal-transformer";
import { Strategy } from "./strategy.entity";

@Entity()
export class MarketAction {
    constructor(
        strategy: Strategy,
        action: MarketActionEnum,
        amount: number,
        stopLoss?: number,
        takeProfit?: number
    ) {
        this.strategy = strategy;
        this.amount = amount;
        this.action = action;
        this.stopLoss = stopLoss || undefined;
        this.takeProfit = takeProfit || undefined;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: MarketActionEnum })
    action!: MarketActionEnum;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        transformer: DecimalTransformer,
        nullable: true,
    })
    price?: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        transformer: DecimalTransformer,
        nullable: true,
    })
    sellPrice?: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        transformer: DecimalTransformer,
        default: 0,
    })
    amount!: number;

    @Column({ nullable: true })
    buyOrderId?: string;

    @Column({ nullable: true })
    sellOrderId?: string;

    @Column({
        type: "enum",
        enum: MarketActionStatusEnum,
        default: MarketActionStatusEnum.OPEN,
    })
    status!: MarketActionStatusEnum;

    @Column({
        type: "decimal",
        precision: 18,
        scale: 8,
        transformer: DecimalTransformer,
        nullable: true,
    })
    stopLoss?: number;

    @Column({
        type: "decimal",
        precision: 18,
        scale: 8,
        transformer: DecimalTransformer,
        nullable: true,
    })
    takeProfit?: number;

    @Column({ nullable: true })
    failedAt?: Date;

    @Column({ nullable: true })
    failedReason?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    closedAt?: Date;

    @ManyToOne(() => Strategy, (strategy) => strategy.marketActions)
    strategy!: Strategy;

    shouldStopLoss(currentPrice: number) {
        if (
            this.stopLoss &&
            currentPrice <= this.stopLoss &&
            this.status === MarketActionStatusEnum.OPEN
        ) {
            return true;
        }

        return false;
    }

    shouldTakeProfit(currentPrice: number) {
        if (
            this.takeProfit &&
            currentPrice >= this.takeProfit &&
            this.status === MarketActionStatusEnum.OPEN
        ) {
            return true;
        }

        return false;
    }
}
