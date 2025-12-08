import { Router } from "express";
import { validateCaptcha } from "../services/recaptcha";
import { sendFormEmail } from "../services/brevo";

export const formsRouter = Router();

formsRouter.post("/submit", async (req, res) => {
  try {
    const body = req.body;

    // Validar captcha
    const score = await validateCaptcha(body.captchaToken, body.formId);
    if (score === null || score < 0.5) {
      return res
        .status(400)
        .json({ success: false, error: "Captcha inválido" });
    }

    // Enviar email
    const result = await sendFormEmail(body);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Error processing form:", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ success: false, error: message });
  }
});
