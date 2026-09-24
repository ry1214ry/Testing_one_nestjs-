import { Column, PrimaryGeneratedColumn } from "typeorm";
export class Sokha{
    @PrimaryGeneratedColumn()
    id: Number;
    @Column()
    name: String;
    @Column()
    age: Number;
    @Column()
    gender: String;
}
