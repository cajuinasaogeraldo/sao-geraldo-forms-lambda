import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { formsRouter } from './routes/forms';
import { createLogger } from './lib/logger';
import payloadSizeMiddleware from './middleware/payload-size';

const log = createLogger('app');

export const app = express();

app.use(
	cors({
		methods: ['GET', 'POST'],
		origin: [
			/^https:\/\/.*\.cajuinasaogeraldo\.com\.br$/,
			'http://localhost:4321',
			'https://red-chamois-284776.hostingersite.com',
			'https://cornflowerblue-wildcat-224161.hostingersite.com',
		],
	})
);

app.use(helmet());

app.use(payloadSizeMiddleware);
app.use(express.json({ limit: '3mb' }));

app.use('/forms', formsRouter);

app.get('/health', (_, res) => {
	log.info('Health check');
	res.json({ status: 'ok' });
});

log.info('App inicializado');
