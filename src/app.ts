import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { formsRouter } from './routes/forms';
import { createLogger } from './lib/logger';

const log = createLogger('app');

export const app = express();

app.use(cors());
app.use(helmet());

app.use('/forms', formsRouter);

app.get('/health', (_, res) => {
	log.info('Health check');
	res.json({ status: 'ok' });
});

log.info('App inicializado');
