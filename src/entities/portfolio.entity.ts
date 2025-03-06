import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DecimalTransformer } from "../utils/decimal-transformer";

@Entity()
export class Portfolio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    totalBalance!: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    availableBalance!: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    reservedBalance!: number;

    @Column("decimal", {
        precision: 16,
        scale: 8,
        default: 0,
        transformer: DecimalTransformer,
    })
    amount!: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}
