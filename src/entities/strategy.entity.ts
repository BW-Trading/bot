import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    OneToMany,
} from "typeorm";
import { StrategyInstanceEnum } from "../strategies/strategies.enum";
import { User } from "./user.entity";
import { MarketDataAccount } from "./market-data-account.entity";
import { Order } from "./order.entity";
import { Position } from "./position.entity";
import { StrategyExecution } from "./strategy-execution.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";

export enum StrategyInstanceStatusEnum {
    ACTIVE = "active",
    STOPPED = "stopped",
}

@Entity()
export class Strategy {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: TradeableAssetEnum })
    asset!: TradeableAssetEnum;

    @ManyToOne(() => User, (user) => user.strategies)
    user!: User;

    @Column({ type: "enum", enum: StrategyInstanceEnum })
    strategyType!: StrategyInstanceEnum;

    @Column("json", { default: {} })
    config!: any;

    @Column("json", { default: {} })
    state!: any;

    @Column({
        type: "enum",
        enum: StrategyInstanceStatusEnum,
        default: StrategyInstanceStatusEnum.STOPPED,
    })
    status!: StrategyInstanceStatusEnum;

    @OneToMany(() => Order, (order) => order.strategy)
    orders!: Order[];

    @ManyToOne(
        () => MarketDataAccount,
        (marketDataAccount) => marketDataAccount.strategies
    )
    marketDataAccount!: MarketDataAccount;

    @OneToMany(() => StrategyExecution, (execution) => execution.strategy)
    executions!: StrategyExecution[];

    @OneToOne(() => Position, (position) => position.strategy)
    position!: Position;

    @Column()
    executionInterval!: string; // Cron expression

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: true })
    active!: boolean;
}
