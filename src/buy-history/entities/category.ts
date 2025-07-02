import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BuyHistory } from "./buy-history.entity";

@Entity({ name: 'category' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true,
    })
    image: string;

    @Column('text', {
        nullable: false,
    })
    description: string;

    @OneToMany(() => BuyHistory, (buyHistory) => buyHistory.category)
    buyHistory: BuyHistory[];
}