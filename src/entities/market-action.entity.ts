import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MarketActionEnum } from "./enums/market-action.enum";

@Entity()
export class MarketAction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: MarketActionEnum })
    action!: MarketActionEnum;

    @CreateDateColumn()
    createdAt!: Date;
}
