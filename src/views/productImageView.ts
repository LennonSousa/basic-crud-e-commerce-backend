import ProductImage from '../models/ProductImagesModel';

export default {
    render(productImage: ProductImage) {
        return {
            id: productImage.id,
            path: `${process.env.HOST_API}/uploads/${productImage.path}`,
        }
    },

    renderMany(productImages: ProductImage[]) {
        return productImages.map(productImage => this.render(productImage));
    }
}