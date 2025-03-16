import { Telegraf } from 'telegraf';
import { getStorage, PollStorage } from './storage';

export function registerEventHandlers(bot: Telegraf) {
    let activePolls: PollStorage = getStorage();

    bot.on('poll_answer', async (ctx) => {
        if (!ctx.pollAnswer || !ctx.pollAnswer.user || !ctx.pollAnswer.option_ids) {
            return console.log('Invalid poll answer:', ctx.pollAnswer);
        }

        const pollId = ctx.pollAnswer.poll_id;
        const userId = ctx.pollAnswer.user.id;
        const optionIds = ctx.pollAnswer.option_ids;

        const poll = await activePolls.loadPoll(pollId);
        if (!poll) {
            return console.log(`Received answer for unknown poll: ${pollId}`);
        }

        optionIds.forEach(optionId => {
            if (poll.votes[optionId] !== undefined) {
                poll.votes[optionId] += 1;
            }
        });

        console.log(`User ${userId} voted in poll '${poll.question}'`);
        optionIds.forEach(optionId => {
            console.log(`- ${poll.options[optionId]}: ${poll.votes[optionId]} votes`);
        });
    });

    bot.on('new_chat_members', (ctx) => {
        if (!ctx.message || !ctx.message.new_chat_members) {
            return;
        }

        if (ctx.message.new_chat_members.some((member) => member.id === bot.botInfo?.id)) {
            ctx.reply('HELLO THERE!');
            console.log('Bot added to chat:', ctx.chat?.id);
        } else {
            console.error('Unexpected new_chat_members event:', ctx.message.new_chat_members);
        }
    });

    bot.on('callback_query', (ctx) => {
        ctx.answerCbQuery('Received your input.');
    });
}