/****
 * Sends a message to a Slack Incoming Webhook.
 * @param messageOrPayload - A string message or a full Slack JSON payload.
 * @returns Promise<void>
 */
export async function sendSlackMessage(
  messageOrPayload: string | Record<string, any>,
  env: Record<string, string>
): Promise<void> {
  const webhookUrl = env.SLACK_WEBHOOK_URL;
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