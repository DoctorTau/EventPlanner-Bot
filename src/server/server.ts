import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { bot } from '../bot';
import { getStorage, PollStorage } from '../storage';
import ServerRequest from '../serverRequest';
import { sendAndPinSummaryMessage } from '../summaryMessageSender';

class EventPlannerServer {
    private app: express.Application;
    private port: number | string;
    private storage: PollStorage;

    constructor(port: number | string = process.env.PORT || 3001) {
        this.app = express();
        this.port = port;
        this.storage = getStorage();

        this.configureMiddleware();
        this.configureRoutes();
    }

    private configureMiddleware(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    private configureRoutes(): void {
        this.app.post('/start-vote', this.startVote.bind(this));
        this.app.post('/send-event-summary', this.sendEventSummary.bind(this));
    }

    private async startVote(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { votingId, options, chatId } = req.body;

            if (!votingId || !Array.isArray(options) || options.length < 2 || !chatId) {
                res.status(400).json({ error: 'Invalid request format' });
                return;
            }
            console.log("Ya kekis");

            // Send poll to chat
            const pollMessage = await bot.telegram.sendPoll(
                chatId,
                `Choose date for the event`,
                options,
                { is_anonymous: false }
            );

            await this.storage.savePoll(pollMessage.poll.id.toString(), votingId, options, new Array(options.length).fill(0));

            res.json({ success: true, pollId: pollMessage.poll.id });
            console.log('Vote started:', votingId, options, chatId);
            return;
        } catch (error) {
            console.error('Error starting vote:', error);
            res.status(500).json({ error: 'Failed to start vote' });
        }
    }

    private async craetePollOnServer(poll: PollDto): Promise<void> {
        try {
            const serverRequest = ServerRequest.getInstance();
            await serverRequest.post('/api/Poll', poll);
            console.trace('Poll created on server:', poll);
        } catch (error) {
            console.error('Error starting vote:', error);
        }
    }

    private async sendEventSummary(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { chatId, title, description, date, location } = req.body;

            if (!chatId || !title || !description || !date || !location) {
                res.status(400).json({ error: 'Invalid request format' });
                return;
            }

            const summaryMessage = {
                chatId,
                title,
                description,
                date,
                location
            };

            await sendAndPinSummaryMessage(summaryMessage);
            res.json({ success: true });
            console.log('Event summary sent:', summaryMessage);
        } catch (error) {
            console.error('Error sending event summary:', error);
            res.status(500).json({ error: 'Failed to send event summary' });
        }
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

interface PollDto {
    votingId: Number;
    options: string[];
    type: PollType;
}

enum PollType {
    Date,
    Location
}

export default EventPlannerServer;