import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config';
import { createPoll, getPollResults } from './pollManager';
import { registerEventHandlers } from './eventHandlers';
import { getStorage } from './storage';
import { registerCommands } from './commands';

// Initialize Redis Storage
const pollStoage = getStorage();

export const bot = new Telegraf(BOT_TOKEN);

// Register commands
registerCommands(bot);

// Register event handlers
registerEventHandlers(bot);

// Start bot
bot.launch().then(() => console.log('Bot started!'));

// Graceful shutdown
process.once('SIGINT', async () => {
    await bot.stop();
    process.exit();
});

process.once('SIGTERM', async () => {
    await bot.stop();
    process.exit();
});