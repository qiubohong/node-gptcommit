import { ISettings } from './types/index';
import { readFileSync } from 'fs';

import { cac } from 'cac';
import colors from 'picocolors';

import Settings from './settings';
import ConfigAction from './actions/config';
import PreviewAction from './actions/preview';
import Debug from 'debug';
const debug = Debug('ngptcommit:cli');

const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url)).toString(),
)

const cli = cac('ngptcommit');

function config(settings: ISettings) {
    cli
        .command('config', '配置全局')
        .option('--keys', '获取全局可配置key值')
        .option('--list', '获取全局配置内容')
        .option('--set <key>', '设置配置项，如：ngptcommit config --set openai.apiKey=sk-xxxx')
        .example('--set openai.apiKey=xxx')
        .option('--get <key>', '设置配置项，如：ngptcommit config --get openai.apiKey')
        .example('--get openai.apiKey')
        .option('--delete <key>', '设置配置项，如：ngptcommit config --delete openai.apiKey')
        .example('--delete openai.apiKey')
        .action((options) => {
            const configAction = new ConfigAction();
            const { keys, list, set, get } = options;
            debug('options', options);
            if (keys) {
                configAction.keys(settings);
            }
            if (list) {
                configAction.list(settings, false);
            }
            if (set) {
                if (typeof set !== 'string') {
                    console.log(colors.red(`set参数必须是对象，如：ngptcommit config --set openai.apiKey=sk-xxxx`));
                    return;
                }
                const [key, value] = set.split('=');
                configAction.set(settings, key, value, false);
            }
            if (get) {
                configAction.get(settings, get);
            }

            if (options.delete) {
                configAction.delete(settings, options.delete, false);
            }
        })
}

function install(settings: ISettings) {
    cli
        .command('install', '开始安装') // default command
        .action((root = '.', options) => {
            console.log(colors.green(`开始安装 gptcommit`));
            console.log('options', options);
        })
}

function preview(settings: ISettings) {
    cli
        .command('preview', '预览提交信息')
        .action(() => {
            debug(colors.green(`开始预览`));
            const previewAction = new PreviewAction(settings);
            previewAction.preview();
        })
}

export default async function run() {
    const settings = new Settings();
    await settings.readConfig();
    // config 配置全局
    config(settings);

    // install 安装
    install(settings);

    // preview 预览
    preview(settings);

    cli.help()
    cli.version(version)

    cli.parse()
}
