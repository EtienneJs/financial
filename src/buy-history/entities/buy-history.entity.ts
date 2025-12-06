import { BankAccount } from "src/bank/entities/bank-account.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BuyHistoryDetalle } from "./buy-history-detalle.entity";
import { Product } from "src/product/entities/product.entity";
import { User } from "src/auth/entities/user.entity";



@Entity({name: 'buy_history'})
export class BuyHistory {
    @PrimaryGeneratedColumn('uuid') 
    id: string; 
    @Column('text', {
        nullable: false,
    })
    description: string;
    @Column('numeric', {
        nullable: false,
    })
    total: number;
    @Column('text', {
        nullable: false,
    })
    date: Date;

    @ManyToOne(() => BankAccount, (banckAccount) => banckAccount.buyHistory, {
    })
    banckAccount: BankAccount;

    @ManyToOne(() => User, (user) => user.buyHistories, {
        nullable: false,
    })
    user: User;

    @OneToMany(() => BuyHistoryDetalle, (buy_history_detalle) => buy_history_detalle.buyHistory, {
        cascade: true,
        eager: true,
    })
    buyHistoryDetalle: BuyHistoryDetalle[];
}
