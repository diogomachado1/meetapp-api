import { Router } from 'express';

import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.get('/', (req, res) => res.send('ok'));

routes.post('/session', SessionController.store);

routes.post('/users', UserController.store);
routes.use(authMiddleware);
routes.put('/users', UserController.update);

export default routes;
