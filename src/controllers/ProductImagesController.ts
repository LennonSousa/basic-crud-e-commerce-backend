import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductImagesRepository from '../repositories/ProductImagesRepository';
import productImageView from '../views/productImageView';

export default {
    async create(request: Request, response: Response) {
        const productImagesRepository = getCustomRepository(ProductImagesRepository);

        if (request.file) {
            const { product } = request.body;

            const requestImages = request.file as Express.Multer.File;

            const image = requestImages;

            const data = {
                path: image.filename,
                product
            };

            const schema = Yup.object().shape({
                path: Yup.string().notRequired(),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            const productImage = productImagesRepository.create(data);

            await productImagesRepository.save(productImage);

            return response.status(201).json(productImageView.render(productImage));
        }
        else
            return response.status(400);
    },

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const productImagesRepository = getCustomRepository(ProductImagesRepository);

        await productImagesRepository.delete(id);

        return response.status(204).send();
    }
}