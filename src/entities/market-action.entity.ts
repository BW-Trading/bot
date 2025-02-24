import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MarketActionEnum } from "./enums/market-action.enum";
import { StrategyExecution } from "./strategy-execution.entity";

@Entity()
export class MarketAction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: MarketActionEnum })
    action!: MarketActionEnum;

    @CreateDateColumn()
    createdAt!: Date;
}
