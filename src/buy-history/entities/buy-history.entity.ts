import { BankAccount } from "src/bank/entities/bank-account.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";



@Entity({name: 'buy_history'})
export class BuyHistory {
    @PrimaryGeneratedColumn('uuid') 
    id: string; 
    @Column('text', {
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
    @Column('numeric', {
        nullable: false,
    })
    price: number;
    @Column('text', {
        nullable: false,
    })
    date: string;

    @Column('text', {
        nullable: false,
    })
    @ManyToOne(() => BankAccount, (banckAccount) => banckAccount.buyHistory, {
    })
    banckAccount: BankAccount;

    @Column('text', {
        nullable: false,
    })
    @ManyToOne(() => Category, (category) => category.buyHistory, {
        eager: true,
    })
    category: Category;
}
