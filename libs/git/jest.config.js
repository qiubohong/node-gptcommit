module.exports = {
    "testEnvironment": "node",
    testMatch: [ //匹配测试用例的文件
        '<rootDir>/test/**/*.test.ts'
    ],
    transform: {
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.ts$': '<rootDir>/node_modules/ts-jest',
    },
    "collectCoverage": true
}

