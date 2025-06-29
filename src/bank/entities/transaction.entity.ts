import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BankAccount } from "./bank-account.entity";

@Entity({name: 'transaccion'})
export class Transaction {
    // Aquí puedes definir las propiedades de la entidad Transaction
    // Por ejemplo:
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text', {
        nullable: false,
    })
    description: string;

    @Column('decimal')
    amount: number;

    @Column('text', {
        nullable: false,
    })
    currency: string;
    @Column('timestamp')
    date: Date;

    @ManyToOne(() => BankAccount, (account) => account.transactions)
    account: BankAccount;
}