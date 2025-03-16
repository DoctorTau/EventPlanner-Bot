import { Telegraf } from 'telegraf';
import { getStorage, PollStorage } from './storage';
import ServerRequest from './serverRequest';

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

    bot.on('new_chat_members', async (ctx) => {
        if (!ctx.message || !ctx.message.new_chat_members) {
            return;
        }

        const chatName: string = (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') ? ctx.chat.title : 'Unknown Chat';
        const creatorTelegramId: number = ctx.message.from.id;
        const currentChatId: number = ctx.chat?.id || 0;

        const serverRequest = ServerRequest.getInstance();

        try {
            if (ctx.message.new_chat_members.some((member) => member.id === bot.botInfo?.id)) {

                await serverRequest.post('/api/Event/create', {
                    "eventName": chatName,
                    "telegramChatId": currentChatId,
                    "userId": creatorTelegramId
                });

                ctx.reply(`Created Event ${chatName}`);
                console.log('Bot added to chat:', ctx.chat?.id);
            } else {
                console.error('Unexpected new_chat_members event:', ctx.message.new_chat_members);
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    });

    bot.on('chat_member', (ctx) => {
        console.log(ctx.chatMember.new_chat_member.user.id);
    });

    bot.on('callback_query', (ctx) => {
        ctx.answerCbQuery('Received your input.');
    });
}