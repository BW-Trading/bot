import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { StrategiesEnum } from "../strategies/strategies";
import { StrategyExecution } from "./strategy-execution.entity";
import { Portfolio } from "./portfolio.entity";

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

    @Column()
    asset!: string;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => StrategyExecution, (execution) => execution.strategy)
    @JoinColumn()
    executions!: StrategyExecution[];

    @OneToOne(() => Portfolio)
    @JoinColumn()
    portfolio!: Portfolio;
}
