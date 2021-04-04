import express from 'express';
import multer from 'multer';

import authMiddleware from './middlewares/auth';
import uploadConfig from './config/upload';

import UsersAuthenticationsController from './controllers/UsersAuthenticationController';
import NewUsersAuthenticationController from './controllers/NewUsersAuthenticationController';
import UsersController from './controllers/UsersController';
import UsersResetPasswordController from './controllers/UsersResetPasswordController';
import ProductsController from './controllers/ProductsController';
import ProductImagesController from './controllers/ProductImagesController';

const routes = express.Router();
const upload = multer(uploadConfig);

routes.use(authMiddleware);

routes.get('/users/authenticated', function (request, response) {
    return response.status(202).json();
});

routes.post('/users/new', NewUsersAuthenticationController.create); // 1 - Create a new user but don't active them.
routes.post('/users/new/authenticate', NewUsersAuthenticationController.show); // 2 - Confirm user e-mail.
routes.put('/users/:id', NewUsersAuthenticationController.update); // 3 - Update the confirmed user and active them.

routes.post('/users/authenticate', UsersAuthenticationsController.create);

routes.get('/users', UsersController.index);
routes.get('/users/:id', UsersController.show);
routes.put('/users/:id', UsersController.update);
routes.delete('/users/:id', UsersController.delete);

routes.post('/users/reset', UsersResetPasswordController.create); // 1 - Create a new user reset password.
routes.post('/users/reset/authenticate', UsersResetPasswordController.show); // 2 - Confirm user e-mail.
routes.put('/users/reset/:id', UsersResetPasswordController.update); // 3 - Update user password.

routes.get('/products', ProductsController.index);
routes.get('/products/:id', ProductsController.show);
routes.post('/products', upload.array('images'), ProductsController.create);
routes.put('/products/:id', ProductsController.update);
routes.delete('/products/:id', ProductsController.delete);

routes.post('/product/images/', upload.single('image'), ProductImagesController.create);
routes.delete('/product/images/:id', ProductImagesController.delete);

export default routes;