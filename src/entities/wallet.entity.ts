import {
    Column,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { MarketDataAccount } from "./market-data-account.entity";
import { DecimalTransformer } from "../utils/decimal-transformer";

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(
        () => MarketDataAccount,
        (marketDataAccount) => marketDataAccount.wallet
    )
    marketDataAccount!: MarketDataAccount;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        transformer: DecimalTransformer,
    })
    balance!: number;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    reservedBalance!: number;

    @Column("decimal", {
        precision: 18,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    placedBalance!: number;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
