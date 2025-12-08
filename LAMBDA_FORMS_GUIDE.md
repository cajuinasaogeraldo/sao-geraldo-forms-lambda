# Lambda Express - reCAPTCHA + Brevo Forms

Lambda standalone com Express para validação de captcha e envio de formulários.

## Estrutura do Projeto

```
lambda-forms/
├── src/
│   ├── index.ts           # Handler Lambda
│   ├── app.ts             # Express app
│   ├── routes/
│   │   └── forms.ts       # Rotas de formulário
│   ├── services/
│   │   ├── recaptcha.ts   # Validação reCAPTCHA
│   │   └── brevo.ts       # Envio de email
│   └── templates/
│       ├── form-agua-revendedor.hbs
│       ├── form-cajuina-distribuidor.hbs
│       └── form-cajuina-parcerias.hbs
├── serverless.yml
├── package.json
└── tsconfig.json
```

---

## Arquivos

### `src/index.ts` - Handler Lambda

```typescript
import serverless from 'serverless-http';
import { app } from './app';
import * as fs from 'fs';

// Setup GCP credentials from environment
const credentials = process.env.GOOGLE_CREDENTIALS_JSON;
if (credentials) {
  fs.writeFileSync('/tmp/gcp-credentials.json', credentials);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/gcp-credentials.json';
}

export const handler = serverless(app);
```

### `src/app.ts` - Express App

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { formsRouter } from './routes/forms';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.use('/forms', formsRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
```

### `src/routes/forms.ts`

```typescript
import { Router } from 'express';
import { validateCaptcha } from '../services/recaptcha';
import { sendFormEmail } from '../services/brevo';

export const formsRouter = Router();

formsRouter.post('/submit', async (req, res) => {
  try {
    const { captchaToken, formId, formData, anexo } = req.body;

    // Validar captcha
    const score = await validateCaptcha(captchaToken);
    if (score === null || score < 0.5) {
      return res.status(400).json({ success: false, error: 'Captcha inválido' });
    }

    // Enviar email
    const result = await sendFormEmail(formId, formData, anexo);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### `src/services/recaptcha.ts`

```typescript
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const client = new RecaptchaEnterpriseServiceClient();

export async function validateCaptcha(token: string): Promise<number | null> {
  const projectId = process.env.GOOGLE_RECAPTCHA_PROJECT_ID;
  const siteKey = process.env.GOOGLE_RECAPTCHA_SITE_KEY;

  const projectPath = client.projectPath(projectId);

  const [response] = await client.createAssessment({
    parent: projectPath,
    assessment: {
      event: { token, siteKey },
    },
  });

  if (!response.tokenProperties?.valid) {
    console.warn('Invalid token:', response.tokenProperties?.invalidReason);
    return null;
  }

  return response.riskAnalysis?.score ?? null;
}
```

### `src/services/brevo.ts`

```typescript
import * as brevo from '@getbrevo/brevo';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const templates: Record<string, HandlebarsTemplateDelegate> = {};

function getTemplate(formId: string): HandlebarsTemplateDelegate {
  if (!templates[formId]) {
    const templatePath = path.join(__dirname, `../templates/form-${formId}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    templates[formId] = Handlebars.compile(source);
  }
  return templates[formId];
}

export async function sendFormEmail(
  formId: string,
  formData: Record<string, any>,
  anexo?: { name: string; content: string },
) {
  const template = getTemplate(formId);
  const htmlContent = template(formData);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = `Novo formulário: ${formId}`;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { name: 'Formulários', email: 'noreply@seudominio.com' };
  sendSmtpEmail.to = [{ email: process.env.FORM_RECIPIENT_EMAIL }];

  if (anexo) {
    sendSmtpEmail.attachment = [
      {
        name: anexo.name,
        content: anexo.content,
      },
    ];
  }

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  return { messageId: result.body.messageId };
}
```

---

## Configuração

### `serverless.yml`

```yaml
service: cajuina-forms
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  region: sa-east-1
  memorySize: 512
  timeout: 30
  environment:
    GOOGLE_RECAPTCHA_PROJECT_ID: ${env:GOOGLE_RECAPTCHA_PROJECT_ID}
    GOOGLE_RECAPTCHA_SITE_KEY: ${env:GOOGLE_RECAPTCHA_SITE_KEY}
    GOOGLE_CREDENTIALS_JSON: ${env:GOOGLE_CREDENTIALS_JSON}
    BREVO_API_KEY: ${env:BREVO_API_KEY}
    FORM_RECIPIENT_EMAIL: ${env:FORM_RECIPIENT_EMAIL}

functions:
  api:
    handler: dist/index.handler
    events:
      - httpApi:
          method: ANY
          path: /{proxy+}

plugins:
  - serverless-offline
```

### `package.json`

```json
{
  "name": "cajuina-forms-lambda",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "serverless offline start",
    "deploy": "npm run build && serverless deploy",
    "deploy:prod": "npm run build && serverless deploy --stage production"
  },
  "dependencies": {
    "express": "^4.21.0",
    "serverless-http": "^3.2.0",
    "@google-cloud/recaptcha-enterprise": "^6.3.1",
    "@getbrevo/brevo": "^3.0.1",
    "handlebars": "^4.7.8",
    "cors": "^2.8.5",
    "helmet": "^8.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "serverless": "^3.38.0",
    "serverless-offline": "^13.3.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Variáveis de Ambiente

| Variável                      | Descrição                            |
| ----------------------------- | ------------------------------------ |
| `GOOGLE_CREDENTIALS_JSON`     | JSON completo da service account GCP |
| `GOOGLE_RECAPTCHA_PROJECT_ID` | ID do projeto GCP                    |
| `GOOGLE_RECAPTCHA_SITE_KEY`   | Site key do reCAPTCHA                |
| `BREVO_API_KEY`               | API key do Brevo                     |
| `FORM_RECIPIENT_EMAIL`        | Email que recebe os formulários      |

---

## Setup

```bash
# Iniciar projeto
mkdir cajuina-forms-lambda && cd cajuina-forms-lambda
npm init -y

# Instalar dependências
npm install express serverless-http @google-cloud/recaptcha-enterprise @getbrevo/brevo handlebars cors helmet
npm install -D typescript @types/express @types/node serverless serverless-offline

# Copiar templates do projeto original
cp -r ../cashew-tree/src/shared/templates/email/*.hbs src/templates/

# Dev local
npm start

# Deploy
npm run deploy
```
