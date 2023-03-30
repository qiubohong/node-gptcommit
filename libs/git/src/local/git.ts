import { simpleGit as SimpleGitFactory, SimpleGit } from 'simple-git';

export interface IGitClient {
    git: SimpleGit;
}

class GitClient implements IGitClient {
    static gitClient: IGitClient;
    git: SimpleGit;
    constructor() {
        const baseDir = process.cwd();
        const options = {
            baseDir,
            binary: "git",
            maxConcurrentProcesses: 1
        };
        this.git = SimpleGitFactory(options);
    }
    /**
     * 单例模式，避免重复渲染
     * @returns 
     */
    static getInstance() {
        if (!GitClient.gitClient) {
            GitClient.gitClient = new GitClient();
        }
        return GitClient.gitClient;
    }


    /**
     * 获取文件不同
     * @returns 
     */
    static async getDiff(): Promise<string> {
        const git = GitClient.getInstance().git;
        const args = [
            "--staged",
            "--ignore-all-space",
            "--diff-algorithm=minimal",
            "--function-context",
        ];
        try {
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                const result = await git.diff(args);
                return result;
            } else {
                throw new Error("未找到本地配置文件。 请先运行 git init 创建一个存储库。");
            }
        } catch (e: any) {
            throw new Error('获取git报错，报错信息：' + e.message);
        }
    }

    /**
     * 获取git hooks目录
     * @returns {string} The path to the hooks directory
     */
    static async getHooksPath() {
        const git = GitClient.getInstance().git;
        const args = ["rev-parse", "--show-toplevel", "--git-path", "hooks"];
        try {
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                const result = await git.raw(args);
                const [, hooks] = result.split("\n");
                return hooks;
            } else {
                throw new Error("未找到本地配置文件。 请先运行 git init 创建一个存储库。");
            }
        } catch (e: any) {
            throw new Error('获取git报错，报错信息：' + e.message);
        }
    }
}

export default GitClient;

