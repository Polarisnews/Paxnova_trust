// SMS stub. Interface mirrors `sendMail` so a Twilio implementation can drop in later.

type SendSmsInput = { to: string; body: string };

export async function sendSms({ to, body }: SendSmsInput): Promise<void> {
  console.info(`[sms:stub] to=${to} body=${JSON.stringify(body)}`);
}
