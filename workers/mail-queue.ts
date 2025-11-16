/// <reference types="@cloudflare/workers-types" />
import { sendFormNotificationMail, sendAutoReplyMail } from "../src/lib/mail";
import type {
  NotificationMailOptions,
  AutoReplyMailOptions,
} from "../src/lib/mail/types";

declare const MAIL_QUEUE: KVNamespace;

interface MailItem {
  type: "notification" | "autoresponder";
  payload: Record<string, unknown>;
}

async function processMailQueue(env: Record<string, unknown>) {
  const queueValue = await MAIL_QUEUE.get("queue");
  let queue: MailItem[] = [];

  if (queueValue) {
    try {
      queue = JSON.parse(queueValue);
    } catch (e) {
      console.error("Failed to parse mail queue:", e);
      queue = [];
    }
  }

  const remainingQueue: MailItem[] = [];

  for (const mail of queue) {
    try {
      if (mail.type === "notification") {
        await sendFormNotificationMail(
          mail.payload as unknown as NotificationMailOptions,
          env as Record<string, string>,
        );
      } else if (mail.type === "autoresponder") {
        await sendAutoReplyMail(
          mail.payload as unknown as AutoReplyMailOptions,
          env as Record<string, string>,
        );
      }
    } catch (error) {
      console.error(`Failed to send mail of type ${mail.type}:`, error);
      remainingQueue.push(mail);
    }
  }

  await MAIL_QUEUE.put("queue", JSON.stringify(remainingQueue));
}

addEventListener(
  "scheduled",
  (event: ScheduledEvent & { env: Record<string, unknown> }) => {
    event.waitUntil(processMailQueue(event.env));
  },
);

addEventListener(
  "fetch",
  (event: FetchEvent & { env: Record<string, unknown> }) => {
    event.respondWith(
      (async () => {
        try {
          await processMailQueue(event.env);
          return new Response("Mail queue processed successfully.", {
            status: 200,
          });
        } catch (error) {
          return new Response(`Error processing mail queue: ${error}`, {
            status: 500,
          });
        }
      })(),
    );
  },
);
