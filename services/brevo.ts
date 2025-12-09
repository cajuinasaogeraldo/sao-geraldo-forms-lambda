import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { FORM_REGISTRY } from '../types/form-registry';
import { createLogger } from '../lib/logger';
import { env } from '../lib/env';
import { AllowedFormIds } from '../types/schemas';

const log = createLogger('brevo');

const emailApi = new TransactionalEmailsApi();
emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY || '');

export interface BrevoMailResult {
	messageId: string;
	success: boolean;
	error?: string;
}

export async function sendFormEmail(body: unknown): Promise<BrevoMailResult> {
	// Validate formId first
	const formId = validateFormId((body as Record<string, unknown>)?.formId);
	const formConfig = FORM_REGISTRY[formId];

	// Validate form data using Zod schema
	const validatedData = validateFormData(body, formConfig.schema);

	try {
		const now = new Date();
		const templateData = buildTemplateData(validatedData, now);

		const htmlContent = compileFormTemplate(formConfig.templateName, templateData);
		const { emailConfig } = formConfig;

		const subject = `${emailConfig.subjectBuilder(templateData)} - ${templateData._date} às ${templateData._time}`;
		const senderName = String(templateData[emailConfig.senderNameField] || 'Formulário');
		const replyToEmail = templateData[emailConfig.replyToEmailField] as string | undefined;
		const anexo = templateData['anexo'] as { name: string; content: string } | undefined;

		const emailData: SendSmtpEmail = {
			sender: {
				email: emailConfig.senderEmail,
				name: senderName,
			},
			to: [{ email: emailConfig.recipientEmail }],
			replyTo: replyToEmail ? { email: replyToEmail, name: senderName } : undefined,
			subject,
			htmlContent,
			attachment: anexo ? [anexo] : undefined,
			tags: emailConfig.tags,
		};

		const response = await emailApi.sendTransacEmail(emailData);

		log.info(
			{ formId, messageId: response.body.messageId, body: response.body },
			`Email enviado com sucesso para ${emailConfig.recipientEmail}`
		);

		return {
			messageId: response.body.messageId || '',
			success: true,
			...response.body,
		};
	} catch (error) {
		log.error({ formId, err: error }, 'Erro ao enviar email');

		return {
			messageId: '',
			success: false,
			error: error instanceof Error ? error.message : 'Erro desconhecido',
		};
	}
}

function validateFormId(formId: unknown): AllowedFormIds {
	if (!formId || !Object.values(AllowedFormIds).includes(formId as AllowedFormIds)) {
		throw new Error(`formId inválido ou não informado. Valores aceitos: ${Object.values(AllowedFormIds).join(', ')}`);
	}
	return formId as AllowedFormIds;
}

function validateFormData(body: unknown, schema: z.ZodSchema): Record<string, unknown> {
	const result = schema.safeParse(body);

	if (!result.success) {
		const messages = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join('; ');
		throw new Error(messages);
	}

	return result.data as Record<string, unknown>;
}

function compileFormTemplate(templateName: string, data: Record<string, unknown>): string {
	const templatePath = getTemplatePath(templateName);

	try {
		const templateContent = fs.readFileSync(templatePath, 'utf-8');
		const template = handlebars.compile(templateContent);
		return template(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		log.error({ templateName, err: error }, 'Erro ao compilar template');
		throw new Error(`Erro ao processar template: ${message}`);
	}
}

export function getTemplatePath(filename: string): string {
	const rootPath = process.cwd();
	const templatePath = path.join(rootPath, 'templates', 'email', filename);

	if (!fs.existsSync(templatePath)) {
		log.error({ filename, rootPath, templatePath }, 'Template não encontrado');
		throw new Error(`Template não encontrado: ${filename}`);
	}

	return templatePath;
}

function buildTemplateData(data: Record<string, unknown>, now: Date): Record<string, unknown> & { _date: string; _time: string } {
	return {
		...data,
		_date: format(now, 'dd/MM/yyyy', { locale: ptBR }),
		_time: format(now, 'HH:mm:ss', { locale: ptBR }),
	};
}
