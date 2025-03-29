import Redis from 'ioredis';

export interface PollStorage {
    savePoll(tgPollId: string, pollId: number, options: string[], votes: number[]): Promise<void>;
    loadPoll(tgPollId: string): Promise<{ pollId: number; options: string[]; votes: number[] } | null>;
    getLatestPoll(): Promise<string | null>;
}

class RedisStorage implements PollStorage {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });
    }

    async savePoll(tgPollId: string, pollId: number, options: string[], votes: number[]): Promise<void> {
        await this.redis.set(`poll:${tgPollId}`, JSON.stringify({ pollId, options, votes }));
    }

    async loadPoll(tgPollId: string): Promise<{ pollId: number; options: string[]; votes: number[] } | null> {
        const data = await this.redis.get(`poll:${tgPollId}`);
        return data ? JSON.parse(data) : null;
    }

    async getLatestPoll(): Promise<string | null> {
        const keys = await this.redis.keys('poll:*');
        return keys.length ? keys[keys.length - 1].replace('poll:', '') : null;
    }
}

let storage: PollStorage;

export function getStorage(): PollStorage {
    if (!storage) {
        storage = new RedisStorage();
    }
    return storage;
}