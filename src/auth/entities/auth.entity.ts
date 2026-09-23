import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Auth {
    @PrimaryGeneratedColumn()
    id: Number;
    @Column()
    name: String;
    @Column()
    email: String;
    @Column()
    password: Number;
}
