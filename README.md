# `node-gptcommit`

 简体中文 | [English](./README.en.md)

本项目来源自[gptcommit](https://github.com/zurawiki/gptcommit)。

根据GPT-3智能化生成git commit信息。

使用此工具，您可以轻松生成清晰、全面和描述性的提交消息，让您专注于编写代码。


## 使用教程

1. 安装
```sh
npm install node-gptcommit -g
```

2. 设置openai的apikey

```
ngptcommit config --set openai.apiKey=sk-xxxxx
```

3. 开始使用

请到某个git仓库的根目录使用，具体如下：

```
cd xxx

ngptcommit preview

```

就可以看到具体返回的信息，具体下文所示：

```
"🤖 GPT-3 返回的总结内容如下:"

feat: 

- 更新项目配置，加强 TypeScript 的选项。
- 添加了包含了推荐和 Prettier 的扩展，设置特定规则和排除的 `tslint.json` 文件。
- 包含了文档配置的 `typedoc.js` 文件。


- 在新的 `tsconfig.json` 中添加严格的 TypeScript 选项。
- 在新的 `tslint.json` 文件中添加了推荐和 Prettier 的扩展。
- 配置了特定规则的排除和 false 选项。
- 添加了文档配置的 `typedoc.js` 文件。

```

4. 更改返回语言

```
ngptcommit config --set output.lang=en
```

支持的语言有：

|语言代码|语言|
|-|-|
|`en`|English|
|`zh-cn`|简体中文|
|`zh-tw`|繁體中文|
|`日本`|日本語|

##遇到任何错误？

如果您遇到任何错误或有任何改进建议，请在[issues](https://github.com/qiubohong/node-gptcommit/issues)中提出问题。

## License

This project is licensed under the [MIT License](./LICENSE).