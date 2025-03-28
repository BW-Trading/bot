import {
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { MarketDataAccount } from "./market-data-account.entity";

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(
        () => MarketDataAccount,
        (marketDataAccount) => marketDataAccount.wallet
    )
    marketDataAccount!: MarketDataAccount;

    @Column("decimal", { precision: 18, scale: 8 })
    balance!: number;

    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    reservedBalance!: number;

    @Column("decimal", { precision: 18, scale: 8, default: 0 })
    placedBalance!: number;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
