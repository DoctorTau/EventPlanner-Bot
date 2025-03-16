import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const API_BASE_URL = process.env.API_BASE_URL || '';

if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is missing in .env');
}