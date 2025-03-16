import { Telegraf } from 'telegraf';
import { createPoll, getPollResults } from './pollManager';
import { fetchData } from './apiHandler';

export function registerCommands(bot: Telegraf) {
    bot.start((ctx) => ctx.reply('Hello! I am your bot. Use /help to see commands.'));
    bot.command('help', (ctx) => ctx.reply('Commands: /vote - create poll, /results - view poll results, /api - fetch API data'));
    bot.command('createpoll', createPoll);
    bot.command('results', getPollResults);
    bot.command('api', fetchData);
}