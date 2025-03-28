import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { Wallet } from "./wallet.entity";
import { MarketDataAccount } from "./market-data-account.entity";
import { Strategy } from "./strategy.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ select: false })
    password!: string;

    @Column({ select: false })
    salt!: string;

    @CreateDateColumn({ type: "timestamp", nullable: true })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    updatedAt!: Date;

    @Column({ default: false })
    archived!: boolean;

    @OneToMany(
        () => MarketDataAccount,
        (marketDataAccount) => marketDataAccount.user,
        { cascade: true }
    )
    marketDataAccounts!: MarketDataAccount[];

    @OneToMany(() => Strategy, (strategy) => strategy.user, { cascade: true })
    strategies!: Strategy[];
}
