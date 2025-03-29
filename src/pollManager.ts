import { Context, Markup } from 'telegraf';
import { getStorage, PollStorage} from './storage';

// Initialize Storage
let storage: PollStorage = getStorage();

// Create a new poll
export async function createPoll(ctx: Context) {
    const message = ctx.message as any;
    const text = message?.text;
    if (!text) return;

    const [questionPart, optionsPart] = text.split('?');
    if (!questionPart || !optionsPart) {
        return ctx.reply('Invalid format. Use: /createpoll Question? Option1, Option2, Option3');
    }

    const question = questionPart.replace('/createpoll', '').trim();
    const options = optionsPart.split(',').map((opt: string) => opt.trim()).filter((opt: any) => opt);

    if (options.length < 2 || options.length > 10) {
        return ctx.reply('Please provide between 2 to 10 options.');
    }

    try {
        const pollMessage = await ctx.replyWithPoll(question, options, { is_anonymous: false });
        // await storage.savePoll(pollMessage.poll.id, question, options, new Array(options.length).fill(0));
    } catch (error) {
        console.error('Failed to create poll:', error);
        ctx.reply('Failed to create poll.');
    }
}

// Handle poll answers
export async function handlePollAnswer(ctx: Context) {
    const pollId = ctx.pollAnswer?.poll_id;
    const optionIds = ctx.pollAnswer?.option_ids;

    if (!pollId || !optionIds) return;

    const poll = await storage.loadPoll(pollId);
    if (!poll) {
        console.log(`Poll not found for ID: ${pollId}`);
        return;
    }

    optionIds.forEach(optionId => {
        poll.votes[optionId] += 1;
    });

    // await storage.savePoll(pollId, poll.question, poll.options, poll.votes);
}

// Retrieve poll results
export async function getPollResults(ctx: Context) {
    const pollId = await storage.getLatestPoll();
    if (!pollId) {
        return ctx.reply('No active polls.');
    }

    const poll = await storage.loadPoll(pollId);
    if (!poll) {
        return ctx.reply('Poll not found.');
    }

    const results = poll.options.map((option, index) => `${option}: ${poll.votes[index]} votes`).join('\n');
    ctx.reply(`Poll Results:\n\n${results}`);
}