import pino from 'pino';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';

// Configuração compatível com Cloudflare Workers e AWS Lambda
export const logger = pino({
	level: isDev ? 'debug' : 'info',
	base: {
		service: 'sao-geraldo-forms-lambda',
	},
	formatters: {
		level: (label: string) => ({ level: label }),
	},
	...(isDev && {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:HH:MM:ss',
				ignore: 'pid,hostname',
				messageFormat: '{context} | {msg}',
			},
		},
	}),
});

// Helper para criar child loggers com contexto
export function createLogger(context: string) {
	return logger.child({ context });
}
