import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import Product from './ProductsModel';

@Entity('product_images')
export default class ProductImagesModel {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    path: string;

    @ManyToOne(() => Product, product => product.images)
    @JoinColumn({ name: 'product_id' })
    product: Product;


    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}