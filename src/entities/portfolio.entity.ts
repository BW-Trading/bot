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

    @Column({ default: 0 })
    inputBalance!: number;

    @UpdateDateColumn()
    updatedAt!: Date;

    /**
     * @param portfolio Portfolio concerné, contenant le solde disponible
     * @param price Prix unitaire d'achat de l'actif
     * @returns Nombre maximal d'unités achetables compte tenu du solde disponible et du prix unitaire.
     * La fonction retourne un nombre arrondi à 8 chiffres après la virgule.
     */
    maxBuyableAmount(price: number): number {
        const rawAmount = this.availableBalance / price;
        const adjustedAmount = Math.floor(rawAmount * 1e8) / 1e8;
        return adjustedAmount;
    }
}
