// src/cats/entities/cat.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity() // <--- Make sure this decorator is above the class
export class Cat {
  @PrimaryGeneratedColumn()  
  id: number;
  @Column()
  name: string;
  @Column()
  age: number;
  @Column()
  sound: string;
}
