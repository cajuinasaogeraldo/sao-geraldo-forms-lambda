export enum AllowedFormIds {
  CAJUINA_PARCERIAS = "cajuina-site-solicitacoes",
  CAJUINA_DISTRIBUIDOR = "cajuina-site-distribuidor",
  AGUA_REVENDEDOR = "agua-site-revendedor",
}

export class BaseFormSubmissionDto {
  captchaToken: string;
  formId: AllowedFormIds;
}

export interface FormEmailConfig {
  senderEmail: string;
  senderNameField: string;
  recipientEmail: string;
  replyToEmailField: string;
  subjectBuilder: (data: Record<string, unknown>) => string;
  tags: string[];
}

export interface FormConfig<
  T extends BaseFormSubmissionDto = BaseFormSubmissionDto
> {
  templateName: string;
  dtoClass: new () => T;
  emailConfig: FormEmailConfig;
}

export const FORM_REGISTRY: Record<AllowedFormIds, FormConfig> = {
  [AllowedFormIds.CAJUINA_PARCERIAS]: {
    templateName: "form-cajuina-parcerias.hbs",
    dtoClass: class extends BaseFormSubmissionDto {
      name: string;
      email: string;
      whatsapp: string;
      institutionName: string;
      institutionEmail: string;
      institutionPhone: string;
      requestType: string;
      eventName: string;
      eventCity: string;
      eventState: string;
      eventDate: string;
      eventTime: string;
      eventObjective: string;
      eventTargetAudience: string;
      eventScope: string;
      eventRequestDetails: string;
      materialPickupDate: string;
      acceptance: boolean;
      anexo?: { name: string; content: string };
    },
    emailConfig: {
      senderEmail: "contato@cajuinasaogeraldo.com.br",
      senderNameField: "name",
      recipientEmail: "si@cajuinasaogeraldo.com.br",
      replyToEmailField: "email",
      subjectBuilder: (data) => `Solicitação de Parceria: ${data["eventName"]}`,
      tags: ["form-submission", "solicitacao", "cajuina"],
    },
  },
  [AllowedFormIds.CAJUINA_DISTRIBUIDOR]: {
    templateName: "form-cajuina-distribuidor.hbs",
    dtoClass: class extends BaseFormSubmissionDto {
      name: string;
      email: string;
      whatsapp: string;
      razaoSocial: string;
      cnpj: string;
      cidadeAtuacao: string;
      acceptance: boolean;
    },
    emailConfig: {
      senderEmail: "contato@cajuinasaogeraldo.com.br",
      senderNameField: "name",
      recipientEmail: "si@cajuinasaogeraldo.com.br",
      replyToEmailField: "email",
      subjectBuilder: (data) =>
        `Solicitação de Distribuidor: ${data["razaoSocial"]}`,
      tags: ["form-submission", "distribuidor", "cajuina"],
    },
  },
  [AllowedFormIds.AGUA_REVENDEDOR]: {
    templateName: "form-agua-revendedor.hbs",
    dtoClass: class extends BaseFormSubmissionDto {
      name: string;
      email: string;
      whatsapp: string;
      razaoSocial: string;
      cnpj: string;
      cidadeAtuacao: string;
      acceptance: boolean;
    },
    emailConfig: {
      senderEmail: "contato@cajuinasaogeraldo.com.br",
      senderNameField: "name",
      recipientEmail: "si@cajuinasaogeraldo.com.br",
      replyToEmailField: "email",
      subjectBuilder: (data) =>
        `Solicitação de Revendedor: ${data["razaoSocial"]}`,
      tags: ["form-submission", "revendedor", "agua"],
    },
  },
};
