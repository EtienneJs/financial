import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";

@Entity({name: 'product'})
export class Product {
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
    @Column('text', {
        nullable: false,
    })
    description: string;
    @Column('numeric', {
        nullable: false,
    })
    price: number;



  @ManyToMany(() => Category, (category) => category.products, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    name: 'products_categories', // Nombre de la tabla intermedia
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}
