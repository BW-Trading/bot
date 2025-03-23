import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";
import { Strategy } from "./strategy.entity";

@Entity()
export class MarketDataAccount {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: ExchangeApiEnum })
    exchangeApi!: ExchangeApiEnum;

    @Column()
    apiKey!: string;

    @ManyToOne(() => User, (user) => user.marketDataAccounts)
    user!: User;

    @OneToMany(() => Strategy, (strategy) => strategy.marketDataAccount)
    strategies!: Strategy[];

    @CreateDateColumn()
    createdAt!: Date;
}
