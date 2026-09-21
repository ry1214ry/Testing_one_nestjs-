import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dog{
    @PrimaryGeneratedColumn()
    id: Number;
    @Column()
    name: String
    @Column()
    age: Number;
    @Column()
    sound: String;
}
