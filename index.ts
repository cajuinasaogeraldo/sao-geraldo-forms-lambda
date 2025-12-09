import { app } from './app';
import serverless from 'serverless-http';
import { env } from './lib/env';
import { createLogger } from './lib/logger';

const isDev = env.NODE_ENV === 'development';

if (isDev) {
	const logger = createLogger('dev-server');
	app.listen(3000, () => {
		logger.info('Server is running on port 3000');
	});
}

export const handler = serverless(app);
