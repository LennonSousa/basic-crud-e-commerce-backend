import Product from '../models/ProductsModel';
import productImageView from './productImageView';

export default {
    render(product: Product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            paused: product.paused,
            published_at: product.published_at,
            images: product.images ? productImageView.renderMany(product.images) : [],
        }
    },

    renderMany(products: Product[]) {
        return products.map(product => this.render(product));
    }
}