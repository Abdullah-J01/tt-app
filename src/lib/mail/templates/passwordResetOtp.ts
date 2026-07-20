import type { Locale } from "@/i18n/config";
import { DEFAULT_LOCALE } from "@/i18n/config";
import type { MailMessage } from "../mailer";

/**
 * The password-reset OTP email.
 *
 * Copy lives here rather than in the i18n JSON because those bundles are shipped
 * to the browser and this text is server-only — and because email needs a locale
 * passed explicitly (there is no request context inside a mail job).
 *
 * Styling is inline and table-free-ish on purpose: email clients strip <style>
 * blocks, and Outlook ignores flex/grid. Colors mirror the app's violet brand so
 * the message reads as part of the product.
 */

interface Copy {
  subject: string;
  heading: string;
  intro: string;
  /** `{minutes}` is substituted. */
  expiry: string;
  ignore: string;
  footer: string;
}

const COPY: Record<Locale, Copy> = {
  en: {
    subject: "Your TaskuTark password reset code",
    heading: "Reset your password",
    intro: "Use this code to finish resetting your TaskuTark password:",
    expiry: "This code expires in {minutes} minutes and can only be used once.",
    ignore:
      "If you didn't request a password reset, you can safely ignore this email — your password stays unchanged.",
    footer: "This is an automated message, please don't reply.",
  },
  et: {
    subject: "Sinu TaskuTarga parooli lähtestamise kood",
    heading: "Lähtesta oma parool",
    intro: "Kasuta seda koodi, et lõpetada oma TaskuTarga parooli lähtestamine:",
    expiry: "Kood aegub {minutes} minuti pärast ja seda saab kasutada ainult üks kord.",
    ignore:
      "Kui sa ei taotlenud parooli lähtestamist, võid selle kirja rahulikult eirata — sinu parool jääb samaks.",
    footer: "See on automaatne teade, palun ära vasta sellele.",
  },
  ru: {
    subject: "Ваш код для сброса пароля TaskuTark",
    heading: "Сброс пароля",
    intro: "Используйте этот код, чтобы завершить сброс пароля TaskuTark:",
    expiry: "Код действителен {minutes} минут и может быть использован только один раз.",
    ignore:
      "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — ваш пароль останется прежним.",
    footer: "Это автоматическое сообщение, пожалуйста, не отвечайте на него.",
  },
};

/** Escapes the few characters that could break out of the HTML we interpolate into. */
const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );

export function passwordResetOtpEmail({
  to,
  code,
  expiresInMinutes,
  locale = DEFAULT_LOCALE,
}: {
  to: string;
  code: string;
  expiresInMinutes: number;
  locale?: Locale;
}): MailMessage {
  const copy = COPY[locale] ?? COPY[DEFAULT_LOCALE];
  const expiry = copy.expiry.replace("{minutes}", String(expiresInMinutes));

  const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;padding:32px;box-shadow:0 4px 24px rgba(76,29,149,0.08);">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <span style="font-size:20px;font-weight:700;color:#4c1d95;letter-spacing:-0.01em;">TaskuTark</span>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:22px;font-weight:700;color:#1f2937;padding-bottom:12px;">
                ${escapeHtml(copy.heading)}
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:14px;line-height:22px;color:#6b7280;padding-bottom:24px;">
                ${escapeHtml(copy.intro)}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <div style="display:inline-block;background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:16px;padding:16px 28px;font-size:34px;font-weight:700;letter-spacing:0.35em;color:#5b21b6;text-indent:0.35em;">
                  ${escapeHtml(code)}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:13px;line-height:20px;color:#6b7280;padding-bottom:20px;">
                ${escapeHtml(expiry)}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #ede9fe;padding-top:20px;font-size:12px;line-height:19px;color:#9ca3af;text-align:center;">
                ${escapeHtml(copy.ignore)}<br /><br />${escapeHtml(copy.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    copy.heading,
    "",
    copy.intro,
    "",
    code,
    "",
    expiry,
    "",
    copy.ignore,
    copy.footer,
  ].join("\n");

  return { to, subject: copy.subject, html, text };
}
