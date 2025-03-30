import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Strategy } from "./strategy.entity";

export enum ExecutionStatusEnum {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
}

@Entity()
export class StrategyExecution {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Strategy, (strategy) => strategy.executions)
    strategy!: Strategy;

    @Column({
        type: "enum",
        enum: ExecutionStatusEnum,
        default: ExecutionStatusEnum.PENDING,
    })
    status!: ExecutionStatusEnum;

    @Column("json", { nullable: true })
    inputData?: any;

    @Column("json", { nullable: true })
    resultData?: any;

    @Column("text", { nullable: true })
    errorMessage?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    startedAt?: Date;

    @Column({ nullable: true })
    completedAt?: Date;

    @Column({ nullable: true })
    failedAt?: Date;
}
