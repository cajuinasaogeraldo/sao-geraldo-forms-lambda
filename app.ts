import express from 'express';
import helmet from 'helmet';
import { formsRouter } from './routes/forms';
import { createLogger } from './lib/logger';
import payloadSizeMiddleware from './middleware/payload-size';

const log = createLogger('app');

export const app = express();

app.use(helmet());

app.use(payloadSizeMiddleware);
app.use(express.json({ limit: '3mb' }));

app.use('/forms', formsRouter);

app.get('/health', (_, res) => {
	log.info('Health check');
	res.json({ status: 'ok' });
});

log.info('App inicializado');
