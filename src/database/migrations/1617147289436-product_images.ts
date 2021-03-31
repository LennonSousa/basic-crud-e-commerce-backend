import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class productImages1617147289436 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'product_images',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                },
                {
                    name: 'path',
                    type: 'varchar',
                },
                {
                    name: 'product_id',
                    type: 'uuid',
                }
            ],
            foreignKeys: [
                {
                    name: 'ProductImage',
                    columnNames: ['product_id'],
                    referencedTableName: 'products',
                    referencedColumnNames: ['id'],
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_images');
    }

}
