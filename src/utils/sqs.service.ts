import AWS from 'aws-sdk';
import { publishEmailNotification } from './sns.service';
import { config } from 'dotenv';

config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL!;

export const pollQueue = async () => {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20
    };

    try {
        const data = await sqs.receiveMessage(params).promise();
        if (!data.Messages || data.Messages.length === 0) return;

        for (const message of data.Messages) {
            try {
                if (!message.Body) {
                    console.error('Mensaje vacío recibido');
                    continue;
                }

                const parsedBody = JSON.parse(message.Body);

                if (parsedBody.Type === 'Notification' && parsedBody.Message) {
                    await sqs.deleteMessage({
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle!
                    }).promise();
                    continue;
                }

                const { email, noteId, downloadUrl } = parsedBody;

                if (!email || !noteId || !downloadUrl) {
                    console.error('Mensaje con datos faltantes:', parsedBody);
                    continue;
                }

                console.log(`Processing notification for ${email}`);
                await publishEmailNotification(email, noteId, downloadUrl);

                await sqs.deleteMessage({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle!
                }).promise();

                console.log(`Notification sent and message deleted successfully`);

            } catch (err) {
                console.error('Error processing message: ', err);
            }
        }
    } catch (err) {
        console.error('Error receiving messages: ', err);
    }
};
