type Fail<TCode extends string> = {
  ok: false;
  error: TCode | "network";
  retryAfterSeconds?: number;
  attemptsLeft?: number;
};

async function post<TOk, TCode extends string>(
  url: string,
  body: unknown,
): Promise<(TOk & { ok: true }) | Fail<TCode>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "network" };
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    // A non-JSON body (proxy error page, 502 HTML) is still a failure — just an
    // unlabelled one.
    if (!response.ok) return { ok: false, error: "network" };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: (payload.error as TCode) ?? "network",
      retryAfterSeconds: payload.retryAfterSeconds as number | undefined,
      attemptsLeft: payload.attemptsLeft as number | undefined,
    };
  }

  // Force `ok: true` rather than trusting the body to carry it — a 2xx with an
  // unparseable body would otherwise produce a result that is neither branch of
  // the union, and every caller's `if (!result.ok)` would fall through.
  return { ...(payload as TOk), ok: true };
}

export type RequestOtpError =
  | "invalid_input"
  | "email_not_found"
  | "cooldown"
  | "rate_limited"
  | "email_failed"
  | "server_error";

export const requestPasswordResetOtp = (email: string, locale?: string) =>
  post<{ expiresInMinutes: number; resendAfterSeconds: number }, RequestOtpError>(
    "/api/auth/password-reset/request",
    { email, locale },
  );

export type VerifyOtpError =
  | "invalid_input"
  | "invalid_code"
  | "expired"
  | "too_many_attempts"
  | "rate_limited"
  | "server_error";

export const verifyPasswordResetOtp = (email: string, code: string) =>
  post<{ ticket: string }, VerifyOtpError>("/api/auth/password-reset/verify", { email, code });

export type ConfirmResetError =
  "invalid_input" | "password_mismatch" | "invalid_ticket" | "server_error";

export const confirmPasswordReset = (input: {
  ticket: string;
  password: string;
  confirmPassword: string;
}) => post<Record<string, never>, ConfirmResetError>("/api/auth/password-reset/confirm", input);
