import { Settings, Summarize, OpenAIClient, splitPrefixInclusive} from '../src/index';
import fs from 'fs'

// test('test openapi', async () => {
//     const apikey = fs.readFileSync('../../apikey.txt', 'utf-8');
//     console.log('apikey:', apikey)
//     const client = OpenAIClient.getInstance(apikey);
//     const res = await client.chatCompletions('Hello world');
//     console.log(res)
//     expect(typeof res).toBe("string");
// })

test('test Summarize', async () => {
    const apikey = fs.readFileSync('../../apikey.txt', 'utf-8');
    const client = OpenAIClient.getInstance(apikey);
    const setting = new Settings();
    const summarize = new Summarize(setting, client);
    const diff = fs.readFileSync('../../diff.txt', 'utf-8');
    const diffArray = splitPrefixInclusive(diff, '\ndiff --git ');
    const res = await summarize.getCommitMessage(diffArray);
    console.log(res);
    expect(typeof res).toBe("string");
}, 70000)