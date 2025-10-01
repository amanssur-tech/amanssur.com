


/**
 * Sends a message to a Slack Incoming Webhook.
 * @param messageOrPayload - A string message or a full Slack JSON payload.
 * @returns Promise<void>
 */
export async function sendSlackMessage(messageOrPayload: string | Record<string, any>): Promise<void> {
  // Try to get webhook URL from process.env or import.meta.env
  const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  const webhookUrl = (
    (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>).SLACK_WEBHOOK_URL : undefined) ||
    (metaEnv ? metaEnv.SLACK_WEBHOOK_URL : undefined)
  );
  if (!webhookUrl) {
    throw new Error('Slack webhook URL not configured in SLACK_WEBHOOK_URL');
  }

  // If the input is a string, wrap as { text: ... }
  const payload = typeof messageOrPayload === 'string'
    ? { text: messageOrPayload }
    : messageOrPayload;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook error: ${response.status} ${response.statusText}: ${text}`);
  }
}