import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";

@Entity({name: 'product'})
export class Product {
    @PrimaryGeneratedColumn('uuid') 
    id: number;
    @Column('text', {
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
    @Column('numeric', {
        nullable: false,
    })
    price: number;

    @Column('text', {
        nullable: false,
    })
    @OneToMany(() => Category, (category) => category.product, {
        cascade: true,
        eager: true,
    })
    categories: Category[];
}
