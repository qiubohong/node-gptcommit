import colors from 'picocolors';
import { Configuration, OpenAIApi } from 'openai';
import { IClient } from '../types';
import Debug from 'debug';
import axios from 'axios';
const debug = Debug('ngptcommit:OpenAiClient');
// 设置axios超时时间
axios.defaults.timeout = 10000;

class Client implements IClient {
    private openai: OpenAIApi;
    private maxTries: number;

    static instance: Client;

    constructor(apiKey: string, retries: number) {
        debug('初始化openai接口, apiKey: ', apiKey);
        const config = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(config);
        this.maxTries = retries;
    }

    static getInstance(apiKey: string, retries: number): IClient {
        if (!Client.instance) {
            Client.instance = new Client(apiKey, retries);
        }
        return Client.instance;
    }

    /**
     * 发起gpt-3请求
     * @param prompt 
     * @returns 
     */
    async completions(prompt: string): Promise<string> {
        return this.chatCompletions(prompt, this.maxTries);
    }

    /**
     * 
     * @param prompt 
     * @param retries 
     * @returns 
     */
    async chatCompletions(prompt: string, retries: number): Promise<string> {
        try {
            return this.chat(prompt);
        } catch (error) {
            debug('调用openai接口失败，重试中：', error?.response?.status ?? error.message);
            if (retries > 0) {
                return new Promise((resolve) => {
                    if (error?.response?.status === 429) {
                        // 如果是429错误，说明请求过于频繁，需要等待一段时间后重试
                        setTimeout(() => {
                            this.chatCompletions(prompt, retries - 1).then(res => {
                                resolve(res);
                            })
                        }, 1000);
                    } else {
                        this.chatCompletions(prompt, retries - 1).then(res => {
                            resolve(res);
                        })
                    }

                });
            } else {
                if (error?.response?.status === 429) {
                    console.log(colors.red(`"🤖 由于你的openAI的有请求次数限制，GPT-3 拒绝了你的请求，我们将忽略该总结内容"`));
                } else {
                    console.log(colors.red(`"🤖 GPT-3 拒绝了你的请求，我们将忽略该总结内容"`));
                }
                return "";
            }
        }
    }

    async chat(prompt: string) {
        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user", // system: 机器人, user: 用户, assistant: 助手
                content: prompt
            }]
        });
        // debug('调用openai接口返回内容：', response.data)
        return response.data.choices[0]?.message?.content ?? "";
    }
}

export default Client;