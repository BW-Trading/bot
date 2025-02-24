import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { StrategiesEnum } from "../strategies/strategies";
import { StrategyExecution } from "./strategy-execution.entity";

@Entity()
export class Strategy {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ type: "enum", enum: StrategiesEnum })
    strategy!: StrategiesEnum;

    @Column("simple-json", { default: {} })
    config!: any;

    @Column()
    interval!: number;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => StrategyExecution, (execution) => execution.strategy)
    @JoinColumn()
    executions!: StrategyExecution[];
}
