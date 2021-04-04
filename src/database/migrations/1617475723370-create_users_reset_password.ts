import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createUsersResetPassword1617475723370 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'users_reset_password',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                },
                {
                    name: 'email',
                    type: 'varchar',
                },
                {
                    name: 'token',
                    type: 'varchar',
                },
                {
                    name: 'expire',
                    type: 'timestamp',
                },
                {
                    name: 'activated',
                    type: 'boolean',
                    default: false,
                }
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users_reset_password');
    }
}
