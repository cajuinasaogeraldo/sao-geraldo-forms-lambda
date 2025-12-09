import { z } from 'zod';

enum AllowedFormIds {
	CAJUINA_PARCERIAS = 'cajuina-site-solicitacoes',
	CAJUINA_DISTRIBUIDOR = 'cajuina-site-distribuidor',
	AGUA_REVENDEDOR = 'agua-site-revendedor',
}

// Base schema for all form submissions
const BaseFormSchema = z.object({
	captchaToken: z.string().min(1, 'Token do captcha é obrigatório'),
	formId: z.nativeEnum(AllowedFormIds),
});

// Schema for anexo (attachment)
const AnexoSchema = z
	.object({
		name: z.string(),
		content: z.string(),
	})
	.optional();

// Cajuína Parcerias schema
const CajuinaParceriasSchema = BaseFormSchema.extend({
	name: z.string().min(1, 'Nome é obrigatório'),
	email: z.string().email('Email inválido'),
	whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
	institutionName: z.string().min(1, 'Nome da instituição é obrigatório'),
	institutionEmail: z.string().email('Email da instituição inválido'),
	institutionPhone: z.string().min(1, 'Telefone da instituição é obrigatório'),
	requestType: z.string().min(1, 'Tipo de solicitação é obrigatório'),
	eventName: z.string().min(1, 'Nome do evento é obrigatório'),
	eventCity: z.string().min(1, 'Cidade do evento é obrigatória'),
	eventState: z.string().min(1, 'Estado do evento é obrigatório'),
	eventDate: z.string().min(1, 'Data do evento é obrigatória'),
	eventTime: z.string().min(1, 'Horário do evento é obrigatório'),
	eventObjective: z.string().min(1, 'Objetivo do evento é obrigatório'),
	eventTargetAudience: z.string().min(1, 'Público-alvo é obrigatório'),
	eventScope: z.string().min(1, 'Alcance do evento é obrigatório'),
	eventRequestDetails: z.string().min(1, 'Detalhes da solicitação são obrigatórios'),
	materialPickupDate: z.string().min(1, 'Data de retirada é obrigatória'),
	acceptance: z.coerce.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
	anexo: AnexoSchema,
});

// Cajuína Distribuidor schema
const CajuinaDistribuidorSchema = BaseFormSchema.extend({
	name: z.string().min(1, 'Nome é obrigatório'),
	email: z.string().email('Email inválido'),
	whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
	razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
	cnpj: z.string().min(1, 'CNPJ é obrigatório'),
	cidadeAtuacao: z.string().min(1, 'Cidade de atuação é obrigatória'),
	acceptance: z.coerce.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
});

// Água Revendedor schema
const AguaRevendedorSchema = BaseFormSchema.extend({
	name: z.string().min(1, 'Nome é obrigatório'),
	email: z.string().email('Email inválido'),
	whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
	razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
	cnpj: z.string().min(1, 'CNPJ é obrigatório'),
	cidadeAtuacao: z.string().min(1, 'Cidade de atuação é obrigatória'),
	acceptance: z.coerce.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
});

export { AllowedFormIds, BaseFormSchema, CajuinaParceriasSchema, CajuinaDistribuidorSchema, AguaRevendedorSchema };
