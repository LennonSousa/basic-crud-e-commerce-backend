import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import ProductImages from './ProductImagesModel';

@Entity('products')
export default class ProductsModel {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column()
    paused: boolean;

    @Column()
    published_at: Date;

    @OneToMany(() => ProductImages, productImage => productImage.product, {
        cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'product_id'})
    images: ProductImages[]

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}