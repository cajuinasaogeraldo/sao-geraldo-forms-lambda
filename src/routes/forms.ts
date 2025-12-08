import { Router } from 'express';
import multer from 'multer';
import { validateCaptcha } from '../services/recaptcha';
import { sendFormEmail } from '../services/brevo';
import { createLogger } from '../lib/logger';

const log = createLogger('forms');

export const formsRouter = Router();

// Multer para multipart/form-data
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

formsRouter.post('/submit', upload.single('anexo'), async (req, res) => {
	const requestId = crypto.randomUUID();
	const reqLog = log.child({ requestId });

	try {
		const body = req.body;

		// Converte anexo para base64 se existir
		if (req.file) {
			body.anexo = {
				name: req.file.originalname,
				content: req.file.buffer.toString('base64'),
			};
		}

		reqLog.info({ formId: body?.formId, hasFile: !!req.file }, 'Requisição recebida');

		if (!body || typeof body !== 'object') {
			reqLog.warn('Body inválido ou vazio');
			return res.status(400).json({ success: false, error: 'Corpo da requisição inválido' });
		}

		if (!body.captchaToken) {
			reqLog.warn('captchaToken não fornecido');
			return res.status(400).json({ success: false, error: 'captchaToken é obrigatório' });
		}

		if (!body.formId) {
			reqLog.warn('formId não fornecido');
			return res.status(400).json({ success: false, error: 'formId é obrigatório' });
		}

		reqLog.info({ formId: body.formId }, 'Validando captcha');

		const score = await validateCaptcha(body.captchaToken, body.formId);
		reqLog.info({ score }, 'Captcha validado');

		if (score === null || score < 0.5) {
			reqLog.warn({ score }, 'Captcha inválido ou score baixo');
			return res.status(400).json({ success: false, error: 'Captcha inválido', score });
		}

		reqLog.info('Enviando email');

		const result = await sendFormEmail(body);

		if (!result.success) {
			reqLog.error({ error: result.error }, 'Erro ao enviar email');
			return res.status(500).json({ success: false, error: result.error });
		}

		reqLog.info({ messageId: result.messageId }, 'Email enviado com sucesso');
		res.json({ success: true, messageId: result.messageId });
	} catch (error) {
		reqLog.error(
			{
				err: error,
				message: error instanceof Error ? error.message : 'Erro desconhecido',
				stack: error instanceof Error ? error.stack : undefined,
			},
			'Erro ao processar formulário'
		);

		const message = error instanceof Error ? error.message : 'Erro desconhecido';
		res.status(500).json({ success: false, error: message });
	}
});
