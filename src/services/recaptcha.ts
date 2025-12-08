import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const client = new RecaptchaEnterpriseServiceClient();

export async function validateCaptcha(
  token: string,
  recaptchaAction?: string
): Promise<number | null> {
  const projectId = process.env.GOOGLE_RECAPTCHA_PROJECT_ID;
  const siteKey = process.env.GOOGLE_RECAPTCHA_SITE_KEY;

  if (!projectId || !siteKey) {
    throw new Error(
      "Missing GOOGLE_RECAPTCHA_PROJECT_ID or GOOGLE_RECAPTCHA_SITE_KEY"
    );
  }

  const projectPath = client.projectPath(projectId);

  try {
    const [response] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: { token, siteKey },
      },
    });

    if (!response.tokenProperties?.valid) {
      console.warn("Invalid token:", response.tokenProperties?.invalidReason);
      return null;
    }

    // Check if the expected action was executed (only for v3/Enterprise v3)
    if (
      recaptchaAction &&
      response.tokenProperties.action !== recaptchaAction
    ) {
      console.warn(
        `Action mismatch: expected '${recaptchaAction}', got '${response.tokenProperties.action}'. Aceito mesmo assim para v2-checkbox.`
      );
      // Accept anyway for v2-checkbox compatibility
    }

    const score = response.riskAnalysis?.score ?? null;
    console.log(`reCAPTCHA score: ${score}`);

    if (response.riskAnalysis?.reasons) {
      response.riskAnalysis.reasons.forEach((reason) => {
        console.debug(`Risk reason: ${reason}`);
      });
    }

    return score;
  } catch (error) {
    console.error("Error creating reCAPTCHA assessment:", error);
    throw error;
  }
}
