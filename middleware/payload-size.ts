const payloadSizeMiddleware = (req, res, next) => {
	const contentLengthHeader = req.headers['content-length'];
	const contentType = req.headers['content-type'];

	console.log('Content-Type:', contentType);
	console.log('Content-Length:', contentLengthHeader, 'bytes');

	if (!contentLengthHeader) {
		console.log('Nenhum Content-Length presente (chunked ou streaming).');
		return next();
	}

	const contentLength = Number(contentLengthHeader);

	if (isNaN(contentLength)) {
		console.warn('Content-Length inválido:', contentLengthHeader);
		return next();
	}

	const MAX_BYTES = 6 * 1024 * 1024;

	if (contentLength > MAX_BYTES) {
		console.error(`⚠️ Payload maior que 6MB! (${contentLength} bytes)`);

		return res.status(413).json({
			error: 'Payload too large',
			maxAllowedBytes: MAX_BYTES,
		});
	}

	next();
};

export default payloadSizeMiddleware;
