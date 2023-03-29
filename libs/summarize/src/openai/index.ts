import { Configuration, OpenAIApi } from 'openai';
import { IClient } from '../types';
import Debug from 'debug';
import axios from 'axios';
const debug = Debug('ngptcommit:OpenAiClient');
// 设置axios超时时间
axios.defaults.timeout = 10000;

class Client implements IClient {
    private openai: OpenAIApi;
    static instance: Client;

    constructor(apiKey: string) {
        debug('初始化openai接口, apiKey: ', apiKey);
        const config = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(config);
    }

    static getInstance(apiKey: string): IClient {
        if (!Client.instance) {
            Client.instance = new Client(apiKey);
        }
        return Client.instance;
    }

    /**
     * 发起gpt-3请求
     * @param prompt 
     * @returns 
     */
    async completions(prompt: string): Promise<string> {
        return this.chatCompletions(prompt);
    }

    /**
     * 
     * @param prompt 
     * @param retries 
     * @returns 
     */
    async chatCompletions(prompt: string) {
        try{
            const response = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user", // system: 机器人, user: 用户, assistant: 助手
                    content: prompt
                }]
            });
            return response.data.choices[0]?.message?.content ?? "";
        }catch(e){
            console.log(e.response)
            return '';
        }
    }
}

export default Client;