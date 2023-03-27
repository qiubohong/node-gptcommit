import fs from 'fs';

/**
 * 将json文件格式化写入
 * @param path 
 * @param json 
 */
export function writeJsonFormat(path: string, json: object) {
    fs.writeFileSync(path, JSON.stringify(json, null, 4), { encoding: 'utf-8', });
}