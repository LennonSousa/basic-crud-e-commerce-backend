import { Entity, Column, PrimaryColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('users_reset_password')
export default class UsersResetPasswordModel {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    email: string;

    @Column()
    token: string;

    @Column()
    expire: Date;

    @Column()
    activated: boolean;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}