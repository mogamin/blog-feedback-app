import * as functions from 'firebase-functions';
import { flatten } from 'lodash';
import { auth, firestore } from 'firebase-admin';
import * as uuidv1 from 'uuid/v1';
import { fetchText } from './fetcher';
import { sendWelcomeMail as sendWelcomeMailAction } from './send-welcome-mail';
import { crowlAndSendMail } from './send-daily-report-mail';
import { db } from './firebase';
import { pubsub } from './pubsub';

export const crossOriginFetch = functions.region('asia-northeast1').https.onCall(async (data, context) => {
  if (!(context.auth && context.auth.uid)) {
    throw new Error('Authorization Error');
  }
  const { url } = data;
  const res = await fetchText(url);
  return { body: res };
});

export const sendWelcomeMail = functions.region('asia-northeast1').auth.user().onCreate(async (user, context) => {
  if (!user.uid) {
    throw new Error('Authorization Error');
  }
  const { uid, email } = user;  
  await sendWelcomeMailAction(email, uid);
  console.log('mail sent')
  return true;
});

type MailMessage = {
  uid: string;
  email: string;
  blogURL: string;  
  uuid: string;
  forceSend: boolean;
}

export const dailyReportMail = functions.region('asia-northeast1').pubsub.topic('daily-report-mail').onPublish(async () => {
  const users = await auth().listUsers(1000);
  const blogSnapshots = await Promise.all(users.users.map(async user => {
    return [user.uid, user.email, await db
      .collection('users')
      .doc(user.uid)
      .collection('blogs')
      .where('sendReport', '==', true)
      .get()] as [string, string, firestore.QuerySnapshot];
  }));

  const uidBlogIds = flatten(blogSnapshots.map(([uid, email, blogSnapshot]) => {
    const blogURLs = blogSnapshot.docs.map(blog => decodeURIComponent(blog.id));
    return blogURLs.map(blogURL => [uid, email, blogURL]) as [string, string, string][];
  }));
  const topic = pubsub.topic('send-report-mail');
  const publisher = topic.publisher();

  for (const [uid, email, blogURL] of uidBlogIds) {
    const uuid = uuidv1();
    const message: MailMessage = { email, uid, blogURL, uuid, forceSend: false };
    await publisher.publish(Buffer.from(JSON.stringify(message)));
    console.log(`${uid}, ${blogURL}`);
  }
  return true;
});

export const subscribeSendReportMail = functions.region('asia-northeast1').pubsub.topic('send-report-mail').onPublish(async (message) => {
  const { email, uid, blogURL, uuid, forceSend }: MailMessage = message.json;
  await crowlAndSendMail(email, uid, blogURL, uuid, forceSend);
  return true;
});

export const sendTestReportMail = functions.region('asia-northeast1').https.onCall(async (data, context) => {
  const { blogURL } = data;
  if (!context.auth) {
    throw new Error('Authorization Error');
  }
  if (!blogURL) {
    throw new Error('Blog URL is missing');
  }
  const user = await auth().getUser(context.auth.uid);
  const { email, uid } = user;
  const uuid = uuidv1(); // dummy
  const topic = pubsub.topic('send-report-mail');
  const publisher = topic.publisher();
  const message: MailMessage = { email, uid, blogURL, uuid, forceSend: true };
  await publisher.publish(Buffer.from(JSON.stringify(message)));
  return true;
});
