import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from "@getbrevo/brevo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import {
  FORM_REGISTRY,
  AllowedFormIds,
  BaseFormSubmissionDto,
} from "../types/form-registry";

const emailApi = new TransactionalEmailsApi();
emailApi.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

const sender = {
  email: process.env.BREVO_SENDER_EMAIL || "contato@cajuinasaogeraldo.com.br",
  name: process.env.BREVO_SENDER_NAME || "Cajuína São Geraldo",
};

export interface BrevoMailResult {
  messageId: string;
  success: boolean;
  error?: string;
}

export async function sendFormEmail(body: any): Promise<BrevoMailResult> {
  // Validate formId
  const formId = validateFormId(body.formId);
  const formConfig = FORM_REGISTRY[formId];

  // Validate form data using DTO
  const validatedData = await validateFormData(body, formConfig.dtoClass);

  try {
    const now = new Date();
    const templateData = buildTemplateData(validatedData, now);

    const htmlContent = compileFormTemplate(
      formConfig.templateName,
      templateData
    );
    const { emailConfig } = formConfig;

    const subject = `${emailConfig.subjectBuilder(templateData)} - ${
      templateData._date
    } às ${templateData._time}`;
    const senderName = String(
      templateData[emailConfig.senderNameField] || "Formulário"
    );
    const replyToEmail = templateData[emailConfig.replyToEmailField] as
      | string
      | undefined;
    const anexo = templateData["anexo"] as
      | { name: string; content: string }
      | undefined;

    const emailData: SendSmtpEmail = {
      sender: {
        email: emailConfig.senderEmail,
        name: senderName,
      },
      to: [{ email: emailConfig.recipientEmail }],
      replyTo: replyToEmail
        ? { email: replyToEmail, name: senderName }
        : undefined,
      subject,
      htmlContent,
      attachment: anexo ? [anexo] : undefined,
      tags: emailConfig.tags,
    };

    const response = await emailApi.sendTransacEmail(emailData);

    console.log(`Formulário ${formId} enviado com sucesso`);

    return {
      messageId: response.body.messageId || "",
      success: true,
    };
  } catch (error) {
    console.error(`Erro ao enviar formulário ${formId}:`, error);

    return {
      messageId: "",
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

function validateFormId(formId: unknown): AllowedFormIds {
  if (
    !formId ||
    !Object.values(AllowedFormIds).includes(formId as AllowedFormIds)
  ) {
    throw new Error(
      `formId inválido ou não informado. Valores aceitos: ${Object.values(
        AllowedFormIds
      ).join(", ")}`
    );
  }
  return formId as AllowedFormIds;
}

async function validateFormData<T extends BaseFormSubmissionDto>(
  body: any,
  dtoClass: new () => T
): Promise<T> {
  const dto = plainToInstance(dtoClass, body);

  try {
    await validateOrReject(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
  } catch (errors) {
    const messages = (errors as any[])
      .map((error) => Object.values(error.constraints || {}).join(", "))
      .join("; ");
    throw new Error(messages);
  }

  return dto;
}

function compileFormTemplate(
  templateName: string,
  data: Record<string, any>
): string {
  const templatePath = getTemplatePath(templateName);

  try {
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(templateContent);
    return template(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Erro ao compilar template ${templateName}: ${message}`);
    throw new Error(`Erro ao processar template: ${message}`);
  }
}

function getTemplatePath(filename: string): string {
  const baseDir =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "templates")
      : path.join(process.cwd(), "src", "templates");

  return path.join(baseDir, filename);
}

function buildTemplateData<T extends BaseFormSubmissionDto>(
  data: T,
  now: Date
): Record<string, unknown> & { _date: string; _time: string } {
  // Convert class instance to plain object
  const dataAsRecord = Object.fromEntries(Object.entries(data));

  return {
    ...dataAsRecord,
    _date: format(now, "dd/MM/yyyy", { locale: ptBR }),
    _time: format(now, "HH:mm:ss", { locale: ptBR }),
  };
}
