import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MarketActionEnum } from "./enums/market-action.enum";
import { StrategyExecution } from "./strategy-execution.entity";
import { MarketActionStatusEnum } from "./enums/market-action-status.enum";
import { DecimalTransformer } from "../utils/decimal-transformer";

@Entity()
export class MarketAction {
    constructor(
        action: MarketActionEnum,
        price: number,
        amount: number,
        exchangeOrderId?: string
    ) {
        this.amount = amount;
        this.action = action;
        this.price = price;
        this.exchangeOrderId = exchangeOrderId || undefined;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: MarketActionEnum })
    action!: MarketActionEnum;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        transformer: DecimalTransformer,
    })
    price!: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        transformer: DecimalTransformer,
    })
    amount!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    exchangeOrderId?: string;

    @ManyToOne(
        () => StrategyExecution,
        (strategyExecution) => strategyExecution.resultingMarketActions
    )
    strategyExecution!: StrategyExecution;

    @Column({
        type: "enum",
        enum: MarketActionStatusEnum,
        default: MarketActionStatusEnum.PENDING,
    })
    status!: MarketActionStatusEnum;

    @Column({ nullable: true })
    failedAt?: Date;

    @Column({ nullable: true })
    failedReason?: string;
}
