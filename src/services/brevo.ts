import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { FORM_REGISTRY, AllowedFormIds } from '../types/form-registry';

const emailApi = new TransactionalEmailsApi();
emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const sender = {
	email: process.env.BREVO_SENDER_EMAIL || 'contato@cajuinasaogeraldo.com.br',
	name: process.env.BREVO_SENDER_NAME || 'Cajuína São Geraldo',
};

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

		console.log(`Formulário ${formId} enviado com sucesso`);

		return {
			messageId: response.body.messageId || '',
			success: true,
		};
	} catch (error) {
		console.error(`Erro ao enviar formulário ${formId}:`, error);

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
		console.error(`Erro ao compilar template ${templateName}: ${message}`);
		throw new Error(`Erro ao processar template: ${message}`);
	}
}

function getTemplatePath(filename: string): string {
	const baseDir =
		process.env.NODE_ENV === 'production' ? path.join(process.cwd(), 'dist', 'templates') : path.join(process.cwd(), 'src', 'templates');

	return path.join(baseDir, filename);
}

function buildTemplateData(data: Record<string, unknown>, now: Date): Record<string, unknown> & { _date: string; _time: string } {
	return {
		...data,
		_date: format(now, 'dd/MM/yyyy', { locale: ptBR }),
		_time: format(now, 'HH:mm:ss', { locale: ptBR }),
	};
}
