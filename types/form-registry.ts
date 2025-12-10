import { FormConfig } from '.';
import { env } from '../lib/env';
import { AllowedFormIds, CajuinaParceriasSchema, CajuinaDistribuidorSchema, AguaRevendedorSchema, ContatoFormSchema } from './schemas';

export const FORM_REGISTRY: Record<AllowedFormIds, FormConfig> = {
	[AllowedFormIds.CAJUINA_PARCERIAS]: {
		templateName: 'form-cajuina-parcerias.hbs',
		schema: CajuinaParceriasSchema,
		emailConfig: {
			senderEmail: env.BREVO_SENDER_EMAIL,
			senderNameField: 'name',
			recipientEmail: env.BREVO_RECIPIENT_EMAIL,
			replyToEmailField: 'email',
			subjectBuilder: (data) => `Solicitação de ${data['requestType']}: ${data['institutionName']}`,
			tags: ['form-submission', 'solicitacao', 'cajuina'],
		},
	},
	[AllowedFormIds.CAJUINA_DISTRIBUIDOR]: {
		templateName: 'form-cajuina-distribuidor.hbs',
		schema: CajuinaDistribuidorSchema,
		emailConfig: {
			senderEmail: env.BREVO_SENDER_EMAIL,
			senderNameField: 'name',
			recipientEmail: env.BREVO_RECIPIENT_EMAIL,
			replyToEmailField: 'email',
			subjectBuilder: (data) => `Solicitação de Distribuidor: ${data['razaoSocial']}`,
			tags: ['form-submission', 'distribuidor', 'cajuina'],
		},
	},
	[AllowedFormIds.CONTATO_FORM]: {
		templateName: 'form-contato.hbs',
		schema: ContatoFormSchema,
		emailConfig: {
			senderEmail: env.BREVO_SENDER_EMAIL,
			senderNameField: 'name',
			recipientEmail: env.BREVO_RECIPIENT_EMAIL,
			replyToEmailField: 'email',
			subjectBuilder: (data) => `Nova Mensagem do Formulário de Contato: ${data['_origin']}`,
			tags: ['form-submission', 'contato', 'site'],
		},
	},
	[AllowedFormIds.AGUA_REVENDEDOR]: {
		templateName: 'form-agua-revendedor.hbs',
		schema: AguaRevendedorSchema,
		emailConfig: {
			senderEmail: env.BREVO_SENDER_EMAIL,
			senderNameField: 'name',
			recipientEmail: env.BREVO_RECIPIENT_EMAIL,
			replyToEmailField: 'email',
			subjectBuilder: (data) => `Solicitação de Revendedor: ${data['razaoSocial']}`,
			tags: ['form-submission', 'revendedor', 'agua'],
		},
	},
};
