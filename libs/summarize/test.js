import { Configuration, OpenAIApi } from 'openai';

(async function () {
    const configuration = new Configuration({
        apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);

    openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user", // system: 机器人, user: 用户, assistant: 助手
            content: '你好'
        }]
    }).then((data) => {
        console.log('API called successfully. Returned data: ' + data.response);
    }).catch((error) => {
        console.error(error.response);
    });
})()