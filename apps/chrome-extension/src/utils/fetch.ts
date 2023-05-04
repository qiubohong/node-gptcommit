export function sendFetch(url: string, method: 'get'| 'post',  params: object) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: 'fetch',
                url,
                method,
                params,
            },
            (response: unknown) => {
                resolve(response)
            },
        )
    })
}