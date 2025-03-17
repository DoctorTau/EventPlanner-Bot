import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { bot } from '../bot'
import { getStorage, PollStorage } from '../storage';

const app = express();
const PORT = process.env.PORT || 3001;
let storage: PollStorage = getStorage();

app.use(cors());
app.use(bodyParser.json());

// API Endpoint to start voting
app.post('/start-vote', async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const { votingId, options, chatId } = req.body;

        if (!votingId || !Array.isArray(options) || options.length < 2 || !chatId) {
            res.status(400).json({ error: 'Invalid request format' });
            return;
        }


        // Send poll to chat
        const pollMessage = await bot.telegram.sendPoll(
            chatId,
            `Choose date for the event`,
            options,
            { is_anonymous: false }
        );

        await storage.savePoll(pollMessage.poll.id, votingId, options, new Array(options.length).fill(0));

        res.json({ success: true, pollId: pollMessage.poll.id });
        console.log('Vote started:', votingId, options, chatId);
        return
    } catch (error) {
        console.error('Error starting vote:', error);
        res.status(500).json({ error: 'Failed to start vote' });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});