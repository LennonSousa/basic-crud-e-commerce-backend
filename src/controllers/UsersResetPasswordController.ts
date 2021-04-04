import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as Yup from 'yup';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mailer from '../modules/mailer';

import { UsersResetPasswordRepository } from '../repositories/UsersResetPasswordRepository';
import UsersRepository from '../repositories/UsersRepository';
import userView from '../views/userView';

export default {
    async show(request: Request, response: Response) {
        const {
            email,
            token,
        } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const usersResetPasswordRepository = getCustomRepository(UsersResetPasswordRepository);

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

        const user = await usersRepository.findOne({
            where: [
                {
                    email,
                    active: 1
                }
            ]
        });

        const userResetPassword = await usersResetPasswordRepository.findOne({
            where: [
                {
                    email
                }
            ]
        });

        if (!user)
            return response.status(400).json({
                error: 'User e-mail dosen\'t exists.'
            });

        if (!userResetPassword)
            return response.status(400).json({
                error: 'User e-mail or token dosen\'t exists.'
            });

        if (!await bcrypt.compare(token, userResetPassword.token))
            return response.status(400).json({
                error: 'Invalid token!'
            });

        const now = new Date();

        if (userResetPassword.expire <= now)
            return response.status(400).json({
                error: 'Expired user token!'
            });

        if (process.env.JWT_SECRET) {
            const newToken = jwt.sign({ id: userResetPassword.id }, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });

            return response.status(200).json({ user: userView.render(user), reset: userResetPassword, token: newToken });
        }

        return response.status(500).json({ message: 'Internal server error' });
    },

    async create(request: Request, response: Response) {
        const {
            email
        } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);

        const data = {
            email,
        };

        // Validation fields.
        const schema = Yup.object().shape({
            email: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        // If users already exists.
        const foundUser = await usersRepository.findOne({
            where: [
                { email }
            ]
        });

        // If user exists and activated.
        if (foundUser && foundUser.active) {
            const usersResetPasswordRepository = getCustomRepository(UsersResetPasswordRepository);

            const tempPassword = crypto.randomBytes(10).toString('hex');
            const hash = await bcrypt.hash(tempPassword, 10);

            const expire = new Date();
            expire.setHours(expire.getHours() + 1);

            const foundUserResetPassword = await usersResetPasswordRepository.findOne({
                where: [
                    { email }
                ]
            });

            if (foundUserResetPassword && !foundUserResetPassword.activated) {
                const { id } = foundUserResetPassword;

                const userResetPassword = usersResetPasswordRepository.create({
                    email,
                    token: hash,
                    expire,
                });

                await usersResetPasswordRepository.update(id, userResetPassword);
            }
            else {
                const userResetPassword = usersResetPasswordRepository.create({
                    email,
                    token: hash,
                    expire,
                });

                await usersResetPasswordRepository.save(userResetPassword);
            }

            try {
                const variables = {
                    store_name: process.env.STORE_NAME,
                    name: foundUser.name,
                    reset_link: `${process.env.APP_URL}/reset?email=${email}&token=${tempPassword}`
                }
                mailer.execute(email, "Hi again!", variables, "reset-user-password").then(() => {
                    return response.status(201).json();
                });
            }
            catch (err) {
                return response.status(500).json({ message: 'Internal server error' });
            }

        }
        else {
            return response.status(400).json({ error: 'User dosen\'t exists.' });
        }
    },

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const {
            reset_id,
            password,
        } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);

        const hash = await bcrypt.hash(password, 10);

        const data = {
            id,
            password: hash,
        };

        const schema = Yup.object().shape({
            password: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        });

        const user = usersRepository.create(data);

        await usersRepository.update(id, user);

        const usersResetPasswordRepository = getCustomRepository(UsersResetPasswordRepository);

        await usersResetPasswordRepository.delete(reset_id);

        return response.status(204).json(user);
    },
}