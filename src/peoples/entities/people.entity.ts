import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class People {
  @PrimaryGeneratedColumn()
  id: Number;
  @Column()
  firstname: String;
  @Column()
  lastname: String;
  @Column()
  age: Number;
}
