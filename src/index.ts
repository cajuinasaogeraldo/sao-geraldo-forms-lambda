import { httpServerHandler } from 'cloudflare:node';
import { app } from './app';
import * as fs from 'fs';

// Setup GCP credentials from environment
const credentials = process.env.GOOGLE_CREDENTIALS_JSON;
if (credentials) {
	fs.writeFileSync('/tmp/gcp-credentials.json', credentials);
	process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/gcp-credentials.json';
}

app.listen(3000, () => {
	console.log('Server started on port 3000');
});

export default httpServerHandler({ port: 3000 });
