import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'counter'})
export class Contador {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text')
    description: string;

    @Column('numeric',{
        default:0
    })
    counts:number;
}
