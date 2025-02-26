import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class Portfolio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    asset!: string;

    @Column("decimal", { precision: 16, scale: 8, default: 0 })
    totalBalance!: number;

    @Column("decimal", { precision: 16, scale: 8, default: 0 })
    availableBalance!: number;

    @Column("decimal", { precision: 16, scale: 8, default: 0 })
    reservedBalance!: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}
