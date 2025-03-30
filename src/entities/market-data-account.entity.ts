import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ExchangeApiEnum } from "../services/market-data/exchange-api.enum";
import { Strategy } from "./strategy.entity";
import { Wallet } from "./wallet.entity";

@Entity()
export class MarketDataAccount {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "enum", enum: ExchangeApiEnum })
    exchangeApi!: ExchangeApiEnum;

    @Column({ unique: true })
    apiKey!: string;

    @ManyToOne(() => User, (user) => user.marketDataAccounts)
    user!: User;

    @OneToMany(() => Strategy, (strategy) => strategy.marketDataAccount)
    strategies!: Strategy[];

    @OneToOne(() => Wallet, (wallet) => wallet.marketDataAccount)
    @JoinColumn()
    wallet!: Wallet;

    @CreateDateColumn()
    createdAt!: Date;
}
