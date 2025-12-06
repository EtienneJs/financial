import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BankAccount } from "./bank-account.entity";
import { User } from "../../auth/entities/user.entity";

@Entity({name: 'banco'})
@Unique(['user', 'name'])
export class Bank {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true
    })
    image: string;

    @ManyToOne(() => User, (user) => user.banks, {
        nullable: false,
    })
    user: User;

    @OneToMany(() => BankAccount, (account) => account.bank, {
        cascade: true,
        eager: true,
    })

    account: BankAccount[];
}
