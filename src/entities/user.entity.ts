import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Strategy } from "./strategy.entity";

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

    @OneToMany(() => Strategy, (strategy) => strategy.user)
    strategies!: Strategy[];
}
