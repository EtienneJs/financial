import { Tropy } from "src/tropy/entities/tropy.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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


    @OneToMany(() => Tropy, (tropy) => tropy.contador, {
        cascade: true,
    })
    tropys: Tropy[];
}
