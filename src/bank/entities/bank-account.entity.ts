import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bank } from "../../bank/entities/bank.entity";
import { Transaction } from "./transaction.entity";
import { BuyHistory } from "src/buy-history/entities/buy-history.entity";

@Entity({name: 'account'})
export class BankAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column('integer', {
        unique: true,
        nullable: false,
        
    })
    nro_account: number;

    @Column('text', {
        nullable: false,
    })
    type_account: string;

    @Column('float', {
        default: 0.0,
    })
    current_balance :number; ;

    @ManyToOne(
        () => Bank,
        (bank) => bank.account,
        { onDelete: 'CASCADE' }
    )
    bank: Bank;

    @OneToMany(() => Transaction, (transaction) => transaction.accountOrigin, {
        cascade: true,
    })
    originTransactions: Transaction[];

    @OneToMany(() => Transaction, (transaction) => transaction.accountDestiny, {
    cascade: true,
    })
    destinyTransactions: Transaction[];

    
    @OneToMany( () => BuyHistory, (buyHistory) => buyHistory.banckAccount, {
        eager: true,
    })
    buyHistory: BuyHistory[];
}


