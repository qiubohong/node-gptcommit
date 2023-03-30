import { LocalGit } from '@node-gptcommit/git-utils';

import { ISettings, IClient, ISummarize, OpenAIClient , Summarize, splitPrefixInclusive } from '@node-gptcommit/summarize';
import colors from 'picocolors';

export interface IPreviewAction {
    preview(settings: ISettings, file: string, line: number, commit: string): Promise<void>;
}

class PreviewAction implements IPreviewAction {
    client: IClient;
    summarizeClient: ISummarize;
    allowAmend: boolean; // 是否允许修改提交信息
    constructor(settings: ISettings) {
        if (!settings.openai || !settings.openai.apiKey) {
            throw new Error(`"🤖 请先配置openai的apiKey"`)
        }

        this.client = OpenAIClient.getInstance(settings.openai.apiKey);
        // 探测是否可以访问openai
        try {
            this.client.chatCompletions('Hello world');
        } catch (err) {
            throw new Error(`"🤖 无法访问openai，请检查网络或者apiKey是否正确"`)
        }

        this.summarizeClient = new Summarize(settings, this.client);
        this.allowAmend = settings.allowAmend;
    }
    /**
     * 预览提交信息
     * @param settings 
     * @param file 
     * @param line 
     * @param commit 
     */
    async preview() {
        console.log(colors.green(`"🤖 正在向 GPT-3 to 请求总结diff内容..."`));

        const diffOutput = await LocalGit.getDiff();
        const diffArray = splitPrefixInclusive(diffOutput, '\ndiff --git ');

        const commitMessage = await this.summarizeClient.getCommitMessage(diffArray);

        let originalMessage = '';
        if (this.allowAmend) {
            commitMessage.split('\n').map((line: string) => {
                return `# ${line}`
            }).join('\n');
            originalMessage = `### BEGIN GIT COMMIT BEFORE AMEND\n${originalMessage}\n### END GIT COMMIT BEFORE AMEND\n`
        }

        console.log(colors.green(`"🤖 GPT-3 返回的总结内容如下:"`));
        console.log(colors.green(commitMessage));
    }
}

export default PreviewAction;