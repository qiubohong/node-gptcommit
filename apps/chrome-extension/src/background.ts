function sendFetch(url: string, method: 'get' | 'post', params: object) {
    return fetch(url);
}

chrome.runtime.onMessage.addListener(async (request: any, sender: any, sendResponse: any) => {
    const { type = 'fetch', url, method, params } = request;
    console.log('request', request);
    if (type === 'fetch') {
        sendFetch(url, method, params);
        console.log('开始返回', request);
        sendResponse('123');
    }
});

export {
    sendFetch
};