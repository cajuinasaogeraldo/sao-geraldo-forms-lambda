import { NextFunction, Request, Response } from 'express';
import { createLogger } from '../lib/logger';

const payloadSizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const logger = createLogger('payload-size');
	const contentLengthHeader = req.headers['content-length'];
	const contentType = req.headers['content-type'];

	logger.info(`Content-Type: ${contentType}`);
	logger.info(`Content-Length: ${contentLengthHeader + ' bytes' || 'Não existe'}`);

	const contentLength = Number(contentLengthHeader);

	if (isNaN(contentLength)) {
		logger.warn(`Content-Length inválido: ${contentLengthHeader}`);
		return next();
	}

	const MAX_BYTES = 6 * 1024 * 1024;

	if (contentLength > MAX_BYTES) {
		logger.error(`⚠️ Payload maior que 6MB! (${contentLength} bytes)`);

		return res.status(413).json({
			error: 'Payload too large',
			maxAllowedBytes: MAX_BYTES,
		});
	}

	next();
};

export default payloadSizeMiddleware;
