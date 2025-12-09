import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { formsRouter } from './routes/forms';
import { createLogger } from './lib/logger';

const log = createLogger('app');

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
	const contentLength = req.headers['content-length'];
	console.log('Content-Length:', contentLength, 'bytes');
	console.log('Content-Type:', req.headers['content-type']);

	if (contentLength && parseInt(contentLength) > 6 * 1024 * 1024) {
		console.error('⚠️ Payload maior que 6MB!');
	}

	next();
});

app.use('/forms', formsRouter);

app.get('/health', (_, res) => {
	log.info('Health check');
	res.json({ status: 'ok' });
});

log.info('App inicializado');
