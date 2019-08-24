import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, res) => res.send('ok'));

export default routes;
