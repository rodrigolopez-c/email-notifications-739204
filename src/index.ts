import express, { Request, Response } from 'express';
import { pollQueue } from './utils/sqs.service';
import { config } from 'dotenv';

config();

const app = express();

const port = process.env.PORT || 3003;

app.get('', (req: Request, res: Response) => {
    res.send('Api works');
});

app.listen(port, () => {
    console.log(`App is running in port ${port}`);
});

console.log("Initializing SQS listener...");

setInterval(() => {
    pollQueue();
}, 5000);