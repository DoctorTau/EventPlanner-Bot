import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config';
import { registerEventHandlers } from './eventHandlers';
import { getStorage } from './storage';
import { registerCommands } from './commands';
import EventPlannerServer from './server/server';

// Initialize Redis Storage
const pollStoage = getStorage();

export const bot = new Telegraf(BOT_TOKEN);

// Register commands
registerCommands(bot);

// Register event handlers
registerEventHandlers(bot);

// Start the server 
const server: EventPlannerServer = new EventPlannerServer(process.env.PORT || 3001);
server.start();

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