import { Contador } from "src/contador/entities/contador.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'tropy'})
export class Tropy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    metodo_description: string;
    
    @Column('bool', {
        default: false,
    })
    completado: boolean;

    @Column("date",{
        nullable:true
    })
    fecha_completado:Date;

    @Column("date",{
        default: new Date()
    })
    fecha_creado:Date;

    @Column("numeric", {
        default:0
    })
    requisito:number;

    @ManyToOne(
        () => Contador,
        (contador) => contador.tropys,
        { onDelete: 'CASCADE' }
    )
    contador: Contador;
}
