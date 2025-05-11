import { Request, Response } from 'express';
import { publishEmailNotification } from '../utils/sns.service';
import { HTTP_STATUS_CODES } from '../types/http-status-codes';

export const notifyClient = async (req: Request, res: Response) => {
    const { email, noteId, filename } = req.body;

    try {
        await publishEmailNotification(email, noteId, filename);
        res.status(200).json({ message: 'Notification sent succesfully' });
    } catch (err) {
        console.error('Error sending notification: ', err);
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: 'Error sending notification' });
    }
}