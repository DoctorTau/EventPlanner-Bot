import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config';
import { createPoll, getPollResults } from './pollManager';
import { registerEventHandlers } from './eventHandlers';
import { getStorage } from './storage';

// Initialize Redis Storage
const pollStoage = getStorage();

const bot = new Telegraf(BOT_TOKEN);

// Register commands
bot.command('createpoll', createPoll);
bot.command('pollresults', getPollResults);

// Register event handlers
registerEventHandlers(bot);

// Start bot
bot.launch().then(() => console.log('Bot started!'));

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));