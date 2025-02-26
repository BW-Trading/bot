import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MarketActionEnum } from "./enums/market-action.enum";
import { StrategyExecution } from "./strategy-execution.entity";

@Entity()
export class MarketAction {
    constructor(
        action: MarketActionEnum,
        price: number,
        size: number,
        asset: string,
        exchangeOrderId?: string
    ) {
        this.asset = asset;
        this.size = size;
        this.action = action;
        this.price = price;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: MarketActionEnum })
    action!: MarketActionEnum;

    @Column()
    asset!: string;

    @Column("decimal", { precision: 16, scale: 8 })
    price!: number;

    @Column("decimal", { precision: 16, scale: 8 })
    size!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    exchangeOrderId?: string;

    @ManyToOne(
        () => StrategyExecution,
        (strategyExecution) => strategyExecution.resultingMarketActions
    )
    strategyExecution!: StrategyExecution;
}
