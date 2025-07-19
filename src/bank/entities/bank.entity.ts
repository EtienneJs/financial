import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BankAccount } from "./bank-account.entity";
@Entity({name: 'banco'})
export class Bank {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true
    })
    image: string;

    @OneToMany(() => BankAccount, (account) => account.bank, {
        cascade: true,
        eager: true,
    })

    account: BankAccount[];
}
