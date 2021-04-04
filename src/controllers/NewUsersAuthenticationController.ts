import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as Yup from 'yup';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mailer from '../modules/mailer';

import UsersRespository from '../repositories/UsersRepository';
import userView from '../views/userView';

export default {
    async show(request: Request, response: Response) {
        const {
            email,
            token,
        } = request.body;

        const userNewRepository = getCustomRepository(UsersRespository);

        const data = {
            email,
            token
        };

        const schema = Yup.object().shape({
            email: Yup.string().required(),
            token: Yup.string().required()
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const userNewAuth = await userNewRepository.findOne({
            where: [
                { email, active: 0 }
            ]
        });

        if (!userNewAuth)
            return response.status(400).json({
                error: 'User already exists and activated!.'
            });

        if (!await bcrypt.compare(token, userNewAuth.password))
            return response.status(400).json({
                error: 'User e-mail or token dosen\'t exists.'
            });

        if (process.env.JWT_SECRET) {
            const newToken = jwt.sign({ id: userNewAuth.id }, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });

            return response.status(201).json({ user: userView.render(userNewAuth), token: newToken });
        }

        return response.status(500).json({ message: 'Internal server error' });
    },

    async create(request: Request, response: Response) {
        const {
            name,
            email
        } = request.body;

        const usersRepository = getCustomRepository(UsersRespository);

        const data = {
            name,
            email,
        };

        // Validation fields.
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const tempPassword = crypto.randomBytes(10).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 10);

        const newUser = usersRepository.create({
            name,
            email,
            password: hash,
        });

        // If users already exists.
        const findedUser = await usersRepository.findOne({
            where: [
                { email }
            ]
        });

        // If dosen't exists, create a new user with a temporary password and send a e-mail.
        if (!findedUser) {
            await usersRepository.save(newUser);

            try {
                const variables = {
                    store_name: process.env.STORE_NAME,
                    name,
                    reset_link: `${process.env.APP_URL}/confirm?email=${email}&token=${tempPassword}`
                }
                mailer.execute(email, "Welcome!", variables, "new-user").then(() => {
                    return response.status(201).json();
                });
            }
            catch (err) {
                return response.status(500).json({ message: 'Internal server error' });
            }

        }
        else if (!findedUser.active) { // If dosen't exists but yet dont't activated, update the user with the temporary password and send a e-mail.
            const { id } = findedUser;

            await usersRepository.update(id, newUser);

            try {
                const variables = {
                    store_name: process.env.STORE_NAME,
                    name,
                    reset_link: `${process.env.APP_URL}/confirm?email=${email}&token=${tempPassword}`
                }
                mailer.execute(email, "Welcome!", variables, "new-user").then(() => {
                    return response.status(201).json();
                });
            }
            catch (err) {
                return response.status(500).json({ message: 'Internal server error' });
            }
        }
        else
            return response.status(400).json({ message: 'User already exists and activated!' });
    },

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const {
            name,
            password,
        } = request.body;

        const usersRepository = getCustomRepository(UsersRespository);

        const hash = await bcrypt.hash(password, 10);

        const data = {
            id,
            name,
            password: hash,
            active: true,
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            password: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const user = usersRepository.create(data);

        await usersRepository.update(id, user);

        return response.status(204).json(user);
    },
}