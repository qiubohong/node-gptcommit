/**
 * 按前缀拆分字符串，包括结果中的前缀。
 * @param str 
 * @param prefix 
 */
export function splitPrefixInclusive(str: string, prefix: string) {
    const splits = str.split(prefix);
    const result: string[] = [];
    splits.forEach((item) => {
        if (item !== '') {
            result.push(`diff --git ${item}`);
        }
    });
    return result;
}

/**
 * 根据diff获取文件名
 * @param gitDiffContent 
 * @returns 
 */
export function getFileNameFromDiff(gitDiffContent: string) {
    const [, suffix] = gitDiffContent.split("diff --git a/")
    const [filename] = suffix.split(" b/")
    return filename;
}