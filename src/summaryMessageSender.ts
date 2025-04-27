import { Context } from 'telegraf';
import { bot } from './bot';
import { Format } from 'telegraf';

export interface SummaryMessage {
    chatId: number;
    title: string;
    description: string;
    date: string;
    location: string;
}

export async function sendAndPinSummaryMessage(summaryMessage: SummaryMessage) {
    function escapeMarkdownV2(text: string): string {
        return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    }

    try {
        const messageText = `*${escapeMarkdownV2(summaryMessage.title)}*\n\n📝 *Description:* ${escapeMarkdownV2(summaryMessage.description)}\n\n📅 *Date:* ${escapeMarkdownV2(summaryMessage.date)}\n\n📍 *Location:* ${escapeMarkdownV2(summaryMessage.location)}`;

        const message = await bot.telegram.sendMessage(summaryMessage.chatId, messageText, {
            parse_mode: 'MarkdownV2'
        });

        await bot.telegram.pinChatMessage(summaryMessage.chatId, message.message_id);
        console.log('Summary message sent and pinned:', messageText);
    } catch (error) {
        console.error('Failed to send and pin summary message:', error);
    }
}