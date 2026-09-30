
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dogs')
export class Dog {

  @PrimaryGeneratedColumn() // autho gnerate normal id
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  age: number;

  @CreateDateColumn()
  createdAt: Date;
}
