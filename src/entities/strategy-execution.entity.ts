import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StrategyExecutionStatusEnum } from "./enums/strategy-execution-status.enum";
import { Strategy } from "./strategy.entity";
import { StrategyResult } from "../strategies/trading-strategy.interface";

@Entity()
export class StrategyExecution {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: StrategyExecutionStatusEnum })
    status!: StrategyExecutionStatusEnum;

    @Column({ nullable: true })
    error?: string;

    @Column({ nullable: true })
    startedAt?: Date;

    @Column({ nullable: true })
    completedAt?: Date;

    @Column({ nullable: true })
    failedAt?: Date;

    @ManyToOne(() => Strategy, (strategy) => strategy.executions)
    strategy!: Strategy;

    @Column({ type: "json", nullable: true })
    strategyResult?: StrategyResult;
}
