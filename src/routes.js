import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';
import NotificationController from './app/controllers/NotificationController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.send('Hello Test'));

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);
routes.use(authMiddleware);
routes.get('/testAuth', (req, res) => res.send('Test Auth'));

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:id', MeetupController.show);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.get('/organizing', OrganizingController.index);

routes.get('/subscriptions', SubscriptionController.index);
routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
