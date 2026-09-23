import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Car {

@PrimaryGeneratedColumn()
    id: Number;
    @Column()
    name: String;
    @Column()
    year: Number;
    @Column()
    color: String;

}
