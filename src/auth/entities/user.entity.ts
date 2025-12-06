import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bank } from '../../bank/entities/bank.entity';
import { BuyHistory } from '../../buy-history/entities/buy-history.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('text', {
    nullable: false,
    select: false, // No incluir password por defecto en las consultas
  })
  password: string;

  @Column('text', {
    nullable: false,
  })
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp', {
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => Bank, (bank) => bank.user, {
    cascade: true,
  })
  banks: Bank[];

  @OneToMany(() => BuyHistory, (buyHistory) => buyHistory.user, {
    cascade: true,
  })
  buyHistories: BuyHistory[];
}

