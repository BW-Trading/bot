import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MarketAction } from "./market-action.entity";
import { StrategyExecutionStatusEnum } from "./enums/strategy-execution-status.enum";

@Entity()
export class StrategyExecution {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: StrategyExecutionStatusEnum })
    status!: StrategyExecutionStatusEnum;

    @OneToOne(() => MarketAction, { eager: true, nullable: true })
    resultingMarketAction?: MarketAction;

    @Column({ nullable: true })
    error?: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    startedAt?: Date;

    @Column({ nullable: true })
    completedAt?: Date;

    @Column({ nullable: true })
    failedAt?: Date;
}
