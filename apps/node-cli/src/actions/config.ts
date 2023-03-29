
import fs from 'fs';
import colors from 'picocolors';
import * as dot from 'dot-wild';
import { ISettings, Settings } from '@node-gptcommit/summarize';

import { writeJsonFormat } from "../utils/write";
import Debug from 'debug';
const debug = Debug('ngptcommit:config');

/**
 * 获取配置文件路径
 */
export function getConfigPath(local: boolean): Promise<string> {
    if (local) {
        return Settings.getLocalConfigPath();
    } else {
        return Settings.getGlobalConfigPath();
    }
}

export interface IConfigAction {
    get(settings: ISettings, fullKey: string): Promise<void>;
    set(settings: ISettings, fullKey: string, value: string, local: boolean): Promise<void>;
    delete(settings: ISettings, fullKey: string, local: boolean): Promise<void>;
    list(settings: ISettings, save: boolean): Promise<void>;
    keys(settings: ISettings): Promise<void>;
}

class ConfigAction implements IConfigAction {
    /**
     * 读取配置文件中的某个key值
     * @param settings 
     * @param fullKey 
     */
    async get(settings: ISettings, fullKey: string) {
        let cloneSetting = JSON.parse(JSON.stringify(settings));
        if (dot.has(cloneSetting, fullKey) === false) {
            console.log(colors.red(`fail get ${fullKey}, ${fullKey} not exist`));
            return;
        }
        const value = dot.get(cloneSetting, fullKey);
        console.log(value);
    }

    /**
     * 修改配置文件中的某个key值
     * @param settings 
     * @param fullKey 
     * @param value 
     * @param local 
     */
    async set(settings: ISettings, fullKey: string, value: string, local: boolean) {
        let cloneSetting = JSON.parse(JSON.stringify(settings));
        cloneSetting = dot.set(cloneSetting, fullKey, value);
        const configPath = await getConfigPath(local);
        debug('设置内容后为：', dot.get(cloneSetting, fullKey));
        fs.writeFile(configPath, JSON.stringify(cloneSetting, null, 4), (err) => {
            if (err) {
                console.log(colors.red(`fail set ${configPath} ${fullKey} to ${value}`));
            }
            console.log(colors.green(`success set ${configPath} ${fullKey} to ${value}`));
        });
    }

    /**
     * 删除配置文件中的某个key值
     * @param settings 
     * @param fullKey 
     * @param local 
     */
    async delete(settings: ISettings, fullKey: string, local: boolean) {
        let cloneSetting = JSON.parse(JSON.stringify(settings));
        if (dot.has(cloneSetting, fullKey) === false) {
            console.log(colors.red(`fail delete ${fullKey}, ${fullKey} not exist`));
            return;
        }
        cloneSetting = dot.remove(settings, fullKey);
        const configPath = await getConfigPath(local);
        fs.writeFileSync(configPath, JSON.stringify(cloneSetting, null, 4));
    }
    /**
     * 展示配置文件内容
     * @param settings 
     * @param save 
     */
    async list(settings: ISettings, save: boolean) {
        const configPath = await Settings.getGlobalConfigPath();
        if (save) {
            writeJsonFormat(configPath, settings);
        }

        const content = fs.readFileSync(configPath, 'utf-8');
        // 打印内容
        console.log(content);
    }

    /**
     * 展示配置文件中可配置的key值
     * @param settings 
     */
    async keys(settings: ISettings) {
        Object.keys(settings).forEach((key: string) => {
            if (typeof settings[key] === 'object') {
                const prefix = key + '.';
                Object.keys(settings[key]).forEach((key2: string) => {
                    console.log(prefix + key2);
                });
            } else {
                console.log(key);
            }
        });
    }
}

export default ConfigAction;