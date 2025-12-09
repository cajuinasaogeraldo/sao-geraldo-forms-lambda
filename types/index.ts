import z from 'zod';
import { AguaRevendedorSchema, BaseFormSchema, CajuinaDistribuidorSchema, CajuinaParceriasSchema } from './schemas';

interface TokenProperties {
	valid: boolean;
	invalidReason?: string;
	action?: string;
	hostname?: string;
	createTime?: string;
}

interface RiskAnalysis {
	score?: number;
	reasons?: string[];
}

interface AssessmentResponse {
	name: string;
	event: {
		token: string;
		siteKey: string;
	};
	tokenProperties: TokenProperties;
	riskAnalysis?: RiskAnalysis;
}

interface GoogleCredentials {
	client_id: string;
	client_secret: string;
	refresh_token: string;
	type: string;
}

export type BaseFormSubmission = z.infer<typeof BaseFormSchema>;
export type CajuinaParceriasSubmission = z.infer<typeof CajuinaParceriasSchema>;
export type CajuinaDistribuidorSubmission = z.infer<typeof CajuinaDistribuidorSchema>;
export type AguaRevendedorSubmission = z.infer<typeof AguaRevendedorSchema>;

export interface FormEmailConfig {
	senderEmail: string;
	senderNameField: string;
	recipientEmail: string;
	replyToEmailField: string;
	subjectBuilder: (data: Record<string, unknown>) => string;
	tags: string[];
}

export interface FormConfig {
	templateName: string;
	schema: z.ZodSchema;
	emailConfig: FormEmailConfig;
}

export { TokenProperties, RiskAnalysis, AssessmentResponse, GoogleCredentials };
