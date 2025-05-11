import AWS from 'aws-sdk';
import { config } from 'dotenv';

config();

const sns = new AWS.SNS({ region: process.env.AWS_REGION });

export const publishEmailNotification = async (
  email: string,
  noteId: string,
  downloadUrl: string
) => {
  const subject = 'Nota de venta generada';

  const message = `Hola,

    Tu nota de venta #${noteId} ya está disponible.

    Puedes descargarla en el siguiente enlace:
    ${downloadUrl}

    Saludos.
    `;

  const params = {
    TopicArn: process.env.SNS_TOPIC_ARN,
    Subject: subject,
    MessageStructure: 'json',
    Message: JSON.stringify({
        default: message,
        email: message
    }),
    MessageAttributes: {
      email: {
        DataType: 'String',
        StringValue: email,
      },
    },
  };

  return sns.publish(params).promise();
};
