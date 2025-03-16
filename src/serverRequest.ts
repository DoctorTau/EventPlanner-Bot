
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL } from './config';

class ServerRequest {
    private static instance: ServerRequest;
    private axiosInstance: AxiosInstance;

    private constructor(baseURL: string, headers: Record<string, string>) {
        this.axiosInstance = axios.create({
            baseURL: baseURL,
            headers: headers
        });
    }

    public static getInstance(): ServerRequest {
        if (!ServerRequest.instance) {
            const baseURL = API_BASE_URL
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            ServerRequest.instance = new ServerRequest(baseURL, headers);
        }
        return ServerRequest.instance;
    }

    private async request<T>(url: string, options: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.request<T>({
                url: url,
                ...options
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.warn("ServerRequest.request", error.response);
                throw new Error(`HTTP error! status: ${error.response.status}`);
            }
            throw error;
        }
    }

    async post<T>(url: string, data: any): Promise<T> {
        return this.request<T>(url, {
            method: 'POST',
            data: data
        });
    }

    async get<T>(url: string): Promise<T> {
        return this.request<T>(url, {
            method: 'GET'
        });
    }

    async delete<T>(url: string, data: any): Promise<T> {
        return this.request<T>(url, {
            method: 'DELETE',
            data: data
        });
    }
}

export default ServerRequest;