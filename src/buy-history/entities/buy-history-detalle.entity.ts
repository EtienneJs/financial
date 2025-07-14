import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BuyHistory } from "./buy-history.entity";
import { Product } from "src/product/entities/product.entity";

@Entity({name: 'buy_history_detalle'})
export class BuyHistoryDetalle {
    @PrimaryGeneratedColumn('uuid') 
    id: string; 

    @Column('numeric', {
        nullable: false,
    })
    quantity: number;

    @ManyToOne(
        () => BuyHistory,
        (bank) => bank.buyHistoryDetalle,
    )
    buyHistory: BuyHistory;

    @ManyToOne(
        () => Product,
        (product) => product.buyHistoryDetalle,
    )
    products: Product;
}