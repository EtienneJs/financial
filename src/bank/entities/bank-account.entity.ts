import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bank } from "../../bank/entities/bank.entity";
import { Transaction } from "./transaction.entity";

@Entity({name: 'account'})
export class BankAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    nro_account: string;

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
        eager: true,
    })
    originTransactions: Transaction[];
        @OneToMany(() => Transaction, (transaction) => transaction.accountDestiny, {
        cascade: true,
        eager: true,
    })
    destinyTransactions: Transaction[];
}
