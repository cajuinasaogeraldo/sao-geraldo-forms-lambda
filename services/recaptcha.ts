import { env } from '../lib/env';
import { logger } from '../lib/logger';
import { AssessmentResponse, GoogleCredentials } from '../types';

async function getAccessToken(): Promise<string> {
	const credentialsJson = env.GOOGLE_CREDENTIALS_JSON;

	if (!credentialsJson) {
		throw new Error('Missing GOOGLE_CREDENTIALS_JSON environment variable');
	}

	let credentials: GoogleCredentials;
	try {
		credentials = JSON.parse(credentialsJson);
	} catch (error: any) {
		throw new Error('Invalid GOOGLE_CREDENTIALS_JSON format', error.message);
	}

	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: credentials.client_id,
			client_secret: credentials.client_secret,
			refresh_token: credentials.refresh_token,
			grant_type: 'refresh_token',
		}),
	});

	if (!tokenResponse.ok) {
		const error = await tokenResponse.text();
		throw new Error(`Failed to refresh access token: ${error}`);
	}

	const tokenData = (await tokenResponse.json()) as { access_token: string };
	return tokenData.access_token;
}

export async function validateCaptcha(token: string, recaptchaAction?: string): Promise<number | null> {
	const projectId = env.GOOGLE_RECAPTCHA_PROJECT_ID;
	const siteKey = env.GOOGLE_RECAPTCHA_SITE_KEY;

	if (!projectId || !siteKey) {
		throw new Error('Missing GOOGLE_RECAPTCHA_PROJECT_ID or GOOGLE_RECAPTCHA_SITE_KEY');
	}

	try {
		const accessToken = await getAccessToken();

		const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments`;

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				event: {
					token,
					siteKey,
				},
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`reCAPTCHA API error: ${JSON.stringify(error)}`);
		}

		const assessment = (await response.json()) as AssessmentResponse;

		if (!assessment.tokenProperties?.valid) {
			console.warn('Invalid token:', assessment.tokenProperties?.invalidReason);
			return null;
		}

		// Check if the expected action was executed (only for v3/Enterprise v3)
		if (recaptchaAction && assessment.tokenProperties.action !== recaptchaAction) {
			console.warn(
				`Action mismatch: expected '${recaptchaAction}', got '${assessment.tokenProperties.action}'. Aceito mesmo assim para v2-checkbox.`
			);
			// Accept anyway for v2-checkbox compatibility
		}

		const score = assessment.riskAnalysis?.score ?? null;
		logger.info(`reCAPTCHA score: ${score}`);

		if (assessment.riskAnalysis?.reasons) {
			assessment.riskAnalysis.reasons.forEach((reason) => {
				console.debug(`Risk reason: ${reason}`);
			});
		}

		return score;
	} catch (error) {
		console.error('Error creating reCAPTCHA assessment:', error);
		throw error;
	}
}
