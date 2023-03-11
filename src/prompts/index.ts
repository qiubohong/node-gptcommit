import ConventionalCommitTemplate from "./conventional_commit";
import SummarizeFileDiffTemlate from "./summarize_file_diff";
import SummarizeCommitTemplate from "./summarize_commit";
import TranslationTemplate from "./translation";
import TitleCommitTemplate from "./title_commit";

export enum TEMPLATEKEY {
    commitSummary,
    commitTitle,
    fileDiff,
    commitPrefix,
    translation,
}

export interface TemplateMap {
    [TEMPLATEKEY.commitSummary]: (commitSummary: string, template?: string) => string;
    [TEMPLATEKEY.commitTitle]: (commitTitle: string, template?: string) => string;
    [TEMPLATEKEY.fileDiff]: (fileDiff: string, template?: string) => string;
    [TEMPLATEKEY.commitPrefix]: (commitPrefix: string, template?: string) => string;
    [TEMPLATEKEY.translation]: (commitMessage: string, outputLanguage: string, template?: string) => string;
}


const TemplateMap: TemplateMap = {
    [TEMPLATEKEY.translation]: (commitMessage: string, outputLanguage: string, template: string = TranslationTemplate) => {
        return template.replace('{{ commit_message }}', commitMessage).replace('{{ output_language }}', outputLanguage);
    },
    [TEMPLATEKEY.commitPrefix]: (commitPrefix: string, template: string = ConventionalCommitTemplate) => {
        return template.replace('{{ summary_points }}', commitPrefix);
    },
    [TEMPLATEKEY.commitTitle]: (commitTitle: string, template: string = TitleCommitTemplate) => {
        return template.replace('{{ summary_points }}', commitTitle);
    },
    [TEMPLATEKEY.commitSummary]: (commitSummary: string, template: string = SummarizeCommitTemplate) => {
        return template.replace('{{ summary_points }}', commitSummary);
    },
    [TEMPLATEKEY.fileDiff]: (fileDiff: string, template: string = SummarizeFileDiffTemlate) => {
        return template.replace('{{ file_diff }}', fileDiff);
    },
}

export default TemplateMap;