import { z } from 'zod';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
	console.log('[env] .env carregado');
}

const envSchema = z.object({
	GOOGLE_RECAPTCHA_PROJECT_ID: z.string(),
	GOOGLE_RECAPTCHA_SITE_KEY: z.string(),
	GOOGLE_CREDENTIALS_JSON: z.string(),
	BREVO_API_KEY: z.string(),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	BREVO_SENDER_EMAIL: z.string(),
	BREVO_SENDER_NAME: z.string(),
});

const env = envSchema.parse(process.env);

export { env, envSchema };
