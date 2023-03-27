import fs from 'fs';
import path from 'path';
import os from 'os';
import { writeJsonFormat } from "./utils/write";
import { ISettings, Language, ModelProvider, OpenAISettings, OutputSettings, PromptSettings } from "./types";
import ConventionalCommitTemplate from "./prompts/conventional_commit";
import SummarizeFileDiffTemlate from "./prompts/summarize_file_diff";
import SummarizeCommitTemplate from "./prompts/summarize_commit";
import TranslationTemplate from "./prompts/translation";
import GitClient from './git';

export const CONFIG_FILE = 'ngptcommit.json';

// 默认忽略文件
export const DEFAULT_FILES_TO_IGNORE = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "Cargo.lock",
];


export const DEFAULT_OPENAI_MODEL = "gpt-3.5-turbo";

class Settings implements ISettings {
    modelprovider: ModelProvider;
    openai: OpenAISettings;
    prompt: PromptSettings;
    output: OutputSettings;
    allowAmend: boolean;
    fileignore: string[];

    constructor() {
        this.modelprovider = ModelProvider.OpenAI; // 默认使用openai
        this.allowAmend = false; // 默认不允许修正
        this.fileignore = DEFAULT_FILES_TO_IGNORE; // 默认忽略文件
        this.openai = {
            apiKey: '',
            model: DEFAULT_OPENAI_MODEL,
            retries: 2,
            waitTime: 2000, // 2秒等待时间
        };
        this.prompt = {
            conventionalCommitPrefix: ConventionalCommitTemplate,
            fileDiff: SummarizeFileDiffTemlate,
            commitSummary: SummarizeCommitTemplate,
            commitTitle: SummarizeCommitTemplate,
            translation: TranslationTemplate,
        };

        this.output = {
            lang: Language.Zh,
            showPerFileSummary: false,
            conventionalCommit: true,
        };
    }

    async readConfig() {
        // 先将全局变量中的配置读取出来 替换默认配置
        try {
            const globalConfigPath = await Settings.getGlobalConfigPath();
            const setting = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));
            this.cloneSettings(setting);
        } catch (error) {
            console.error(error.message);
        }
        // 再读取本地配置 替换全局配置
        const localConfigPath = await Settings.getLocalConfigPath();
        if (localConfigPath) {
            try {
                const setting = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
                this.cloneSettings(setting);
            } catch (error) {
                console.error(error.message);
            }
        }

        // 如果配置中openai.apikey没有，则用全局变量替换
        const OpenAIApiKey = process.env.OPENAI_API_KEY;
        if (!this.openai.apiKey && OpenAIApiKey) {
            this.openai.apiKey = OpenAIApiKey;
        }
    }

    cloneSettings(setting: any) {
        const cloneSettings = JSON.parse(JSON.stringify(this));

        Object.keys(setting).forEach(key => {
            if (typeof setting[key] === 'object') {
                Object.keys(setting[key]).forEach(subKey => {
                    cloneSettings[key][subKey] = setting[key][subKey];
                })
            } else {
                cloneSettings[key] = setting[key];
            }
        });

        this.allowAmend = cloneSettings.allowAmend;
        this.fileignore = cloneSettings.fileignore;
        this.modelprovider = cloneSettings.modelprovider;
        this.openai = cloneSettings.openai;
        this.output = cloneSettings.output;
        this.prompt = cloneSettings.prompt;
    }
    /**
     * 获取本地配置文件路径
     * @returns 
     */
    static async getLocalConfigPath(): Promise<string> {
        try {
            const gitHookDir = await GitClient.getHooksPath();
            if (fs.existsSync(gitHookDir)) {
                const configPath = path.join(gitHookDir, CONFIG_FILE);
                if (!fs.existsSync(configPath)) {
                    writeJsonFormat(configPath, {});
                }
                return configPath;
            }
        } catch (e) {
            console.error(e.message);
            return '';
        }
        return '';
    }

    /**
     * 获取全局配置文件路径
     * @returns 
     */
    static async getGlobalConfigPath(): Promise<string> {
        const homedir = os.homedir();
        const configDir = path.join(homedir, '.config', 'ngptcommit');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }
        const configPath = path.join(configDir, CONFIG_FILE);
        if (!fs.existsSync(configPath)) {
            writeJsonFormat(configPath, {});
        }
        return configPath;
    }

}

export default Settings;