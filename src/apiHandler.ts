import { Context } from 'telegraf';
import axios from 'axios';
import { API_BASE_URL } from './config';

export async function fetchData(ctx: Context) {
    try {
        const response = await axios.get(`${API_BASE_URL}/data`);
        ctx.reply(`API Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        ctx.reply(`Failed to fetch API data: ${axios.isAxiosError(error) ? error.message : 'Unknown error'}`);
    }
}