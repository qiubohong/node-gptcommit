# `node-gptcommit`

[简体中文](./README.md) | English

This project comes from [gptcommit](https://github.com/zurawiki/gptcommit).

Intelligently generate git commit information based on GPT-3.

Using this tool, you can easily generate clear, comprehensive and descriptive commit messages, allowing you to focus on writing code.


## Tutorial

1. Installation
```sh
npm install node-gptcommit -g
```

2. Set the apikey of openai

```
ngptcommit config --set openai.apiKey=sk-xxxxx
```

3. Get started

Please go to the root directory of a git warehouse to use, as follows:

```
cd xxx

ngptcommit preview

```

You can see the specific returned information, as shown below:

```
"🤖 The summary returned by GPT-3 is as follows:"

feature:

- Updated project configuration to enhance TypeScript options.
- Added `tslint.json` file that includes extensions for Recommendation and Prettier, setting specific rules and exclusions.
- The `typedoc.js` file that contains the documentation configuration.


- Added strict TypeScript options in new `tsconfig.json`.
- Added recommendations and Prettier extensions to the new `tslint.json` file.
- Exclusions and false options for specific rules are configured.
- Added `typedoc.js` file for documentation configuration.

```

4. Change return language

```
ngptcommit config --set output.lang=en
```

Supported languages ​​are:

|Language Code|Language|
|-|-|
|`en`|English|
|`zh-cn`|简体中文|
|`zh-tw`|繁體中文|
|`日本`|日本語|

## Encountered any bugs?

If you encounter any bugs or have any suggestions for improvement, please file an issue in [issues](https://github.com/qiubohong/node-gptcommit/issues).

## License

This project is licensed under the [MIT License](./LICENSE).