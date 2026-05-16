// Minimal mailer abstraction. Uses Resend's HTTP API when RESEND_API_KEY is set;
// otherwise logs the message to the server console so dev flows still demo end-to-end.

type SendMailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

const FROM = process.env.MAIL_FROM ?? "Paxnova Trust <no-reply@paxnovatrust.com>";
const API_KEY = process.env.RESEND_API_KEY;

export async function sendMail({ to, subject, html, text }: SendMailInput): Promise<void> {
  if (!API_KEY) {
    console.info(
      `[mail:dev] to=${to} subject=${JSON.stringify(subject)} body=${
        text ?? html ?? ""
      }`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html: html ?? `<pre>${text ?? ""}</pre>`,
      text: text ?? undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    console.error(`[mail] resend ${res.status}: ${body}`);
    throw new Error(`Mail send failed: ${res.status}`);
  }
}
