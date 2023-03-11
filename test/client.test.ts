import Client from '../src/openai/client';

test('test client', () => {
    const client = new Client("sk-xxxx", "https://api.openai.com/v1", "org-xxxx");
    console.log(client);
    expect(client).toBeDefined();
})