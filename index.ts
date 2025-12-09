import { app } from './app';
import serverless from 'serverless-http';
import { env } from './lib/env';

const isDev = env.NODE_ENV === 'development';

if (isDev) {
	app.listen(3000, () => {
		console.log('Server is running on port 3000');
	});
}

export const handler = serverless(app);
