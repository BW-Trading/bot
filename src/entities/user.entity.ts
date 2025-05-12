import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { MarketDataAccount } from "./market-data-account.entity";
import { Strategy } from "./strategy.entity";
import { AsyncLocalStorage } from "async_hooks";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { Position } from "./position.entity";

const userContext = new AsyncLocalStorage<{ userId: string }>();

export const setUserContext = (userId: string, callback: () => void) => {
    userContext.run({ userId }, callback);
};

export const getContextUserId = (): string => {
    const userId = userContext.getStore()?.userId;
    if (!userId) {
        throw new UnauthenticatedError();
    }
    return userId;
};

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column()
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
