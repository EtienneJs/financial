import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bank } from "../../bank/entities/bank.entity";

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
}
