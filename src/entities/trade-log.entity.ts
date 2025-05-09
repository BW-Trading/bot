import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TradeLog {
    @PrimaryGeneratedColumn()
    id!: number;
}
