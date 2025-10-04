/// <reference types="@cloudflare/workers-types" />
import { sendFormNotificationMail, sendAutoReplyMail } from '../../src/lib/mail';

declare const MAIL_QUEUE: KVNamespace;

interface MailItem {
  type: 'notification' | 'autoresponder';
  payload: any;
}

async function processMailQueue() {
  const queueValue = await MAIL_QUEUE.get('queue');
  let queue: MailItem[] = [];

  if (queueValue) {
    try {
      queue = JSON.parse(queueValue);
    } catch (e) {
      console.error('Failed to parse mail queue:', e);
      queue = [];
    }
  }

  const remainingQueue: MailItem[] = [];

  for (const mail of queue) {
    try {
      if (mail.type === 'notification') {
        await sendFormNotificationMail(mail.payload);
      } else if (mail.type === 'autoresponder') {
        await sendAutoReplyMail(mail.payload);
      }
    } catch (error) {
      console.error(`Failed to send mail of type ${mail.type}:`, error);
      remainingQueue.push(mail);
    }
  }

  await MAIL_QUEUE.put('queue', JSON.stringify(remainingQueue));
}

addEventListener('scheduled', (event: ScheduledEvent) => {
  event.waitUntil(processMailQueue());
});

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      try {
        await processMailQueue();
        return new Response('Mail queue processed successfully.', { status: 200 });
      } catch (error) {
        return new Response(`Error processing mail queue: ${error}`, { status: 500 });
      }
    })()
  );
});
