import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from './logger';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
	logger.info('[env] .env carregado');
}

const envSchema = z.object({
	GOOGLE_RECAPTCHA_PROJECT_ID: z.string(),
	GOOGLE_RECAPTCHA_SITE_KEY: z.string(),
	GOOGLE_CREDENTIALS_JSON: z.string(),
	BREVO_API_KEY: z.string(),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	BREVO_SENDER_EMAIL: z.string().default('contato@cajuinasaogeraldo.com.br'),
	BREVO_SENDER_NAME: z.string().default('Cajuína São Geraldo'),
	BREVO_RECIPIENT_EMAIL: z.string().default('si@cajuinasaogeraldo.com.br'),
});

const env = envSchema.parse(process.env);

export { env, envSchema };
