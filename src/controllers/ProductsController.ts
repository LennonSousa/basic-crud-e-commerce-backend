import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as Yup from 'yup';
import { ProductsRepository } from '../repositories/ProductsRepository';
import productView from '../views/productView';

export default {
    async index(request: Request, response: Response) {
        const productsRepository = getCustomRepository(ProductsRepository);

        const products = await productsRepository.find({
            order: {
                published_at: "ASC"
            },
            relations: [
                'images',
            ]
        });

        return response.json(productView.renderMany(products));
    },

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const productsRepository = getCustomRepository(ProductsRepository);

        const product = await productsRepository.findOneOrFail(id, {
            relations: [
                'images',
            ]
        });

        return response.json(productView.render(product));
    },

    async create(request: Request, response: Response) {
        let {
            name,
            description,
            price,
        } = request.body;

        price = Number(price);

        const productsRepository = getCustomRepository(ProductsRepository);

        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        });

        const data = {
            name,
            description,
            price,
            images
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().notRequired(),
            price: Yup.number().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required(),
                })
            ),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const product = productsRepository.create(data);

        await productsRepository.save(product);

        return response.status(201).json(productView.render(product));
    },

    async update(request: Request, response: Response) {
        const { id } = request.params;

        let {
            name,
            description,
            price,
            paused,
        } = request.body;

        price = Number(price);

        if (paused)
            paused = Yup.boolean().cast(paused);

        const productsRepository = getCustomRepository(ProductsRepository);

        const data = {
            id,
            name,
            description,
            price,
            paused,
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().notRequired(),
            price: Yup.number().required(),
            paused: Yup.boolean().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const product = productsRepository.create(data);

        await productsRepository.update(id, product);

        return response.status(204).json(productView.render(product));
    },

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const productsRepository = getCustomRepository(ProductsRepository);

        await productsRepository.delete(id);

        return response.status(204).send();
    }
}