import { LocalGit } from '../src/index';
import fs from 'fs'

test('test get local git diff', async ()=> {
    const diff = await LocalGit.getDiff();
    fs.writeFileSync('../../diff.txt', diff)
    expect(typeof diff).toBe("string")
})