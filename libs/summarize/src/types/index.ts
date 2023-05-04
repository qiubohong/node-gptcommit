/**
 * 模型提供者
 */
export enum ModelProvider {
    OpenAI, // OpenAI模型提供者
    TesterFoobar // TesterFoobar 另外一个AI模型提供者
}

/**
 * OpenAI设置
 */
export interface OpenAISettings {
    apiKey: string, // OpenAI API Key
    model?: string, // OpenAI 模型
    retries: number, // 重试次数
    waitTime: number, // 缓冲等待时间 由于openai会有请求频率限制，所以可以设置每次请求后等待时间
}

/**
 * 提示设置
 */
export interface PromptSettings {
    conventionalCommitPrefix?: string, // 规范化提交前缀
    commitSummary?: string, // 提交摘要
    commitTitle?: string, // 提交标题
    fileDiff?: string, // 文件差异
    translation?: string, // 翻译语言种类
}

/**
 * 输出设置
 */
export interface OutputSettings {
    conventionalCommit: boolean, // 是否使用规范化提交
    lang: Language, // 提交信息输出语言
    showPerFileSummary: boolean, // 是否显示每个文件的摘要
}

export interface Object {
    [key: string]: any;
}

/**
 * 配置文件内容属性
 */
export interface ISettings extends Object {
    modelprovider: ModelProvider, // 模型提供者
    openai: OpenAISettings, // OpenAI设置
    prompt: PromptSettings, // 提示设置
    output: OutputSettings, // 输出设置
    allowAmend: boolean, // 是否允许修改提交
    fileignore: string[], // 忽略文件 和 gitignore 类似
    isBrowser?: boolean, // 是否是浏览器
}

/**
 * AI客户端
 */
export interface IClient {
    completions(prompt: string): Promise<string>;
    chatCompletions(prompt: string): Promise<string>;
}

/**
 * 语言种类
 */
export enum Language {
    En = "en",
    Zh = "zh",
    ZhTw = "zh-tw",
    Ja = "ja",
}