import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'category' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true,

    })
    image: string;

    @Column('text', {
        nullable: false,
    })
    description: string;

    @ManyToOne(() => Product, (product) => product.categories)
    product: Product;


}