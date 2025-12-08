import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Configuração compatível com Cloudflare Workers e AWS Lambda
export const logger = pino({
	level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
	transport: isDev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:HH:MM:ss',
					ignore: 'pid,hostname',
					messageFormat: '{context} | {msg}',
				},
		  }
		: undefined,
	base: {
		service: 'sao-geraldo-forms-lambda',
	},
	formatters: {
		level: (label: string) => ({ level: label }),
	},
});

// Helper para criar child loggers com contexto
export function createLogger(context: string) {
	return logger.child({ context });
}
