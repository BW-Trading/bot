import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { StrategiesEnum } from "./enums/strategies.enum";
import { StrategyExecution } from "./strategy-execution.entity";
import { Portfolio } from "./portfolio.entity";
import { TradeableAssetEnum } from "./enums/tradeable-asset.enum";
import { User } from "./user.entity";

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

    @Column({ type: "enum", enum: TradeableAssetEnum })
    asset!: TradeableAssetEnum;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => StrategyExecution, (execution) => execution.strategy)
    @JoinColumn()
    executions!: StrategyExecution[];

    @OneToOne(() => Portfolio)
    @JoinColumn()
    portfolio!: Portfolio;

    @ManyToOne(() => User, (user) => user.strategies, { eager: true })
    user!: User;
}
