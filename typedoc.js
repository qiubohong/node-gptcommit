module.exports = {
    entryPoints: ["./src/index.ts", "./CHANGELOG.md"],
    out: "doc",
    name: "sdk api文档",
    includeVersion: true, // 是否将包的版本号添加到API文档中，默认值为 false。
};