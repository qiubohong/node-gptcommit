import colors from 'picocolors';
import Progress from 'progress';

import { ISettings, IClient, Language } from './types/index';
import { getFileNameFromDiff } from './utils/strhelp';
import TemplateMap, { TEMPLATEKEY } from './prompts';
import Debug from 'debug';

const debug = Debug('ngptcommit:Summarize');

export interface ISummarize {
    getCommitMessage(fileDiffs: string[]): Promise<string>;
}

class Summarize implements ISummarize {
    client: IClient;
    settings: ISettings;
    fileIgnore: string[]; // 忽略的文件列表
    conventionalCommit: boolean; // 是否使用规范commit
    showPerFileSummary: boolean; // 是否显示每个文件的总结
    outputLang: Language; // 输出语言
    progress: Progress; // 进度条
    constructor(settings: ISettings, client: IClient) {
        this.client = client;
        this.settings = settings;
        this.fileIgnore = settings.fileignore;
        this.conventionalCommit = settings.output.conventionalCommit === undefined ? true : !!settings.output.conventionalCommit;
        this.showPerFileSummary = settings.output.showPerFileSummary === undefined ? false : !!settings.output.showPerFileSummary;
        this.outputLang = settings.output.lang === undefined ? Language.En : settings.output.lang;

        this.progress = new Progress(' 生成提交信息 [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: 100,
        });
    }

    async getCommitMessage(fileDiffs: string[]) {
        const summaryTasks = fileDiffs.map((fileDiff) => this.processFileDiff(fileDiff));

        const summaries = await Promise.all(summaryTasks);
        const summaryPoints = summaries.map((summary: any) => {
            const [fileName, completion] = summary;
            return `${fileName}\n ${completion}`;
        }).join('\n\n');

        const message = [];
        // 当要求使用规范commit时，使用规范commit模板
        if (this.conventionalCommit) {
            const [title, completion, commitPrefix] = await Promise.all([
                this.commitTitle(summaryPoints),
                this.commitSummary(summaryPoints),
                this.conventionalCommitPrefix(summaryPoints),
            ]);
            if (commitPrefix) {
                message.push(`${commitPrefix}: `);
            }

            debug(`前缀: ${commitPrefix}, \n标题: ${title},  \n汇总: ${completion}`);
            message.push(`${title}\n\n${completion}\n\n`);
            this.progress.tick();
        } else {
            const [title, completion] = await Promise.all([
                this.commitTitle(summaryPoints),
                this.commitSummary(summaryPoints),
            ]);
            message.push(`${title}\n\n${completion}\n\n`);
            this.progress.tick();
        }

        if (this.showPerFileSummary) {
            summaries.forEach((summary: any) => {
                const [fileName, completion] = summary;
                message.push(`[${fileName}]\n${completion}\n"`);
            })
            this.progress.tick();
        }

        const commitMessage = message.join('\n');

        const translationMessage = await this.commitTranslate(commitMessage);

        this.progress.update(1);
        return translationMessage;
    }

    /**
     * 将提交要点信息转换为标题
     * @param summaryPoints 
     * @returns 
     */
    async commitTitle(summaryPoints: string): Promise<string> {
        const commitTitlePrompt = TemplateMap[TEMPLATEKEY.commitTitle](summaryPoints, this.settings.prompt.commitTitle)
        const completion = await this.client.completions(commitTitlePrompt);
        return completion;
    }

    /**
     * 将提交每个文件要点信息再次总结要点
     * @param summaryPoints 
     * @returns 
     */
    async commitSummary(summaryPoints: string): Promise<string> {
        const commitSummaryPrompt = TemplateMap[TEMPLATEKEY.commitSummary](summaryPoints, this.settings.prompt.commitSummary);
        const completion = await this.client.completions(commitSummaryPrompt);
        return completion;
    }

    /**
     * 将提交要点信息转换为规范commit前缀，如：feat、fix等
     * @param summaryPoints 
     */
    async conventionalCommitPrefix(summaryPoints: string): Promise<string> {
        const commitPrefixPrompt = TemplateMap[TEMPLATEKEY.commitPrefix](summaryPoints, this.settings.prompt.conventionalCommitPrefix);
        let completion = await this.client.completions(commitPrefixPrompt);
        return completion;
    }

    /// 按文件分割gitdiff的内容。
    ///
    /// 文件路径是返回的元组中的第一个字符串
    /// 文件内容是返回的元组中的第二个字符串。
    ///
    /// 该函数假定file_diff输入格式正确
    /// 根据Git文档中描述的Diff格式：
    /// https://git-scm.com/docs/git-diff
    async processFileDiff(fileDiff: string): Promise<[string, string]> {
        const fileName = getFileNameFromDiff(fileDiff);
        console.log('fileName: ', fileName)
        if (!fileName) {
            return [fileName, ''];
        }
        if (this.fileIgnore.includes(fileName)) {
            console.log(colors.yellow(`${fileName} is ignored`));
            return [fileName, ''];
        }

        const completion = await this.diffSummary(fileName, fileDiff);
        return [fileName, completion];
    }

    /**
     * 将每个文件diff内容转换为总结一句话
     * @param fileName 
     * @param fileDiff 
     * @returns 
     */
    async diffSummary(fileName: string, fileDiff: string): Promise<string> {
        const summaryPrompt = TemplateMap[TEMPLATEKEY.fileDiff](fileDiff, this.settings.prompt.fileDiff);
        const completion = await this.client.completions(summaryPrompt);
        return completion;
    }

    /**
     * 将提交内容翻译
     * @param commitMessage 
     */
    async commitTranslate(commitMessage: string): Promise<string> {
        if (this.outputLang !== Language.En) {
            const translatePrompt = TemplateMap[TEMPLATEKEY.translation](commitMessage, this.outputLang, this.settings.prompt.translation);
            const completion = await this.client.completions(translatePrompt);
            return completion;
        }
        return commitMessage;
    }
}


export default Summarize;