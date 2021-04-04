import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as Yup from 'yup';

import userView from '../views/userView';
import UsersRepository from '../repositories/UsersRepository';

export default {
    async index(request: Request, response: Response) {
        const usersRepository = getCustomRepository(UsersRepository);

        const users = await usersRepository.find();

        return response.json(userView.renderMany(users));
    },

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const usersRepository = getCustomRepository(UsersRepository);

        const user = await usersRepository.findOneOrFail(id);

        return response.json(userView.render(user));
    },

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const {
            name,
            email,
        } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);

        const data = {
            id,
            name,
            email,
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const user = usersRepository.create(data);

        await usersRepository.update(id, user);

        return response.status(204).json(user);
    },

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const usersRepository = getCustomRepository(UsersRepository);

        await usersRepository.softDelete(id);

        return response.status(204).send();
    }
}