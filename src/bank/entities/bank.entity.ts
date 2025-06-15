import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'banco'})
export class Bank {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column ('text', {
        nullable: true,
        array: true,
        default:[]
    })

    account: string[];

    @Column('text', {
        nullable: true
    })
    image: string;
}
