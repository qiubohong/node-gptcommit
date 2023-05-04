import { Configuration, OpenAIApi } from 'openai';
import fetch from 'node-fetch';
import { createParser } from 'eventsource-parser'
// bilibili session token
const BILIBILI_SESSION_TOKEN = '';
function extractUrl(videoUrl) {
    const matchResult = videoUrl.match(/\/video\/([^\/\?]+)/)
    if (!matchResult) {
        return
    }
    return matchResult[1]
}

function extractPage(currentVideoUrl, searchParams) {
    const queryString = currentVideoUrl.split('?')[1]
    const urlParams = new URLSearchParams(queryString)
    return urlParams.get('p')
}


async function fetchBilibiliSubtitleUrls(videoId) {
    const sample = (arr = []) => {
        const len = arr === null ? 0 : arr.length
        return len ? arr[Math.floor(Math.random() * len)] : undefined
    }
    const sessdata = sample(BILIBILI_SESSION_TOKEN.split(','))
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        Host: 'api.bilibili.com',
        Cookie: `SESSDATA=${sessdata}`,
    }
    const commonConfig = {
        method: 'GET',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers,
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }

    const params = videoId.startsWith('av') ? `?aid=${videoId.slice(2)}` : `?bvid=${videoId}`
    const requestUrl = `https://api.bilibili.com/x/web-interface/view${params}`

    console.log(`fetch`, requestUrl)
    const response = await fetch(requestUrl, commonConfig)
    const json = await response.json()

    return json.data
}

async function fetchBilibiliSubtitle(
    videoId
) {
    const res = await fetchBilibiliSubtitleUrls(videoId)
    const { title, desc, dynamic, subtitle } = res || {}
    const hasDescription = desc || dynamic
    const descriptionText = hasDescription ? `${desc} ${dynamic}` : undefined
    const subtitleList = subtitle?.list
    if (!subtitleList || subtitleList?.length < 1) {
        return { title, subtitlesArray: null, descriptionText }
    }

    const betterSubtitle = subtitleList.find(({ lan }) => lan === 'zh-CN') || subtitleList[0]
    const subtitleUrl = betterSubtitle?.subtitle_url?.startsWith('//')
        ? `https:${betterSubtitle?.subtitle_url}`
        : betterSubtitle?.subtitle_url
    console.log('subtitle_url', subtitleUrl)

    const subtitleResponse = await fetch(subtitleUrl)
    const subtitles = await subtitleResponse.json()
    const transcripts = reduceBilibiliSubtitleTimestamp(subtitles?.body, shouldShowTimestamp)
    return { title, subtitlesArray: transcripts, descriptionText }
}

function limitTranscriptByteLength(str, byteLimit = 6200) {
    const utf8str = unescape(encodeURIComponent(str))
    const byteLength = utf8str.length
    if (byteLength > byteLimit) {
        const ratio = byteLimit / byteLength
        const newStr = str.substring(0, Math.floor(str.length * ratio))
        return newStr
    }
    return str
}

function getUserSubtitlePrompt(title, transcript, videoConfig) {
    const videoTitle = title?.replace(/\n+/g, ' ').trim()
    const videoTranscript = limitTranscriptByteLength(transcript).replace(/\n+/g, ' ').trim()
    const language = 'zh-CN'
    const sentenceCount = videoConfig.sentenceNumber || 7
    const emojiTemplateText = videoConfig.showEmoji ? '[Emoji] ' : ''
    const emojiDescriptionText = videoConfig.showEmoji ? 'Choose an appropriate emoji for each bullet point. ' : ''
    const shouldShowAsOutline = Number(videoConfig.outlineLevel) > 1
    const wordsCount = videoConfig.detailLevel ? (Number(videoConfig.detailLevel) / 100) * 2 : 15
    const outlineTemplateText = shouldShowAsOutline ? `\n    - Child points` : ''
    const outlineDescriptionText = shouldShowAsOutline
        ? `Use the outline list, which can have a hierarchical structure of up to ${videoConfig.outlineLevel} levels. `
        : ''
    const prompt = `Your output should use the following template:\n## Summary\n## Highlights\n- ${emojiTemplateText}Bulletpoint${outlineTemplateText}\n\nYour task is to summarise the text I have given you in up to ${sentenceCount} concise bullet points, starting with a short highlight, each bullet point is at least ${wordsCount} words. ${outlineDescriptionText}${emojiDescriptionText}Use the text above: {{Title}} {{Transcript}}.\n\nReply in ${language} Language.`

    return `Title: "${videoTitle}"\nTranscript: "${videoTranscript}"\n\nInstructions: ${prompt}`
}

function trimOpenAiResult(result) {
    const answer = result.choices[0].message?.content || ''
    if (answer.startsWith('\n\n')) {
        return answer.substring(2)
    }
    return answer
}

async function fetchOpenAIResult(payload, apiKey, videoConfig) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    console.log({ apiKey })
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey ?? ''}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
    })

    if (res.status !== 200) {
        const errorJson = await res.json()
        throw new Error(`OpenAI API Error [${res.statusText}]: ${errorJson.error?.message}`)
    }

    if (!payload.stream) {
        const result = await res.json()
        const betterResult = trimOpenAiResult(result)

        console.log('========betterResult========', betterResult)

        return betterResult
    }

    let counter = 0
    let tempData = ''
    const stream = new ReadableStream({
        async start(controller) {
            // callback
            async function onParse(event) {
                if (event.type === 'event') {
                    const data = event.data
                    // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                    if (data === '[DONE]') {
                        // active
                        controller.close()
                        console.info(`video cached:`, data)
                        console.log('========betterResult after streamed========', tempData)
                        return
                    }
                    try {
                        const json = JSON.parse(data)
                        const text = json.choices[0].delta?.content || ''
                        tempData += text
                        if (counter < 2 && (text.match(/\n/) || []).length) {
                            // this is a prefix character (i.e., "\n\n"), do nothing
                            return
                        }
                        const queue = encoder.encode(text)
                        controller.enqueue(queue)
                        counter++
                    } catch (e) {
                        // maybe parse error
                        controller.error(e)
                    }
                }
            }

            // stream response (SSE) from OpenAI may be fragmented into multiple chunks
            // this ensures we properly read chunks and invoke an event for each SSE event stream
            const parser = createParser(onParse)
            // https://web.dev/streams/#asynchronous-iteration
            for await (const chunk of res.body) {
                parser.feed(decoder.decode(chunk))
            }
        },
    })

    return stream
}



(async function () {
    const configuration = new Configuration({
        apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);

    const videoConfig = {}

    const biliUrl = `https://www.bilibili.com/video/BV1Ya4y1E7Vd/`;

    const videoId = extractUrl(biliUrl);

    const { title, subtitlesArray, descriptionText } = await fetchBilibiliSubtitle(videoId);
    const userPrompt = getUserSubtitlePrompt(title, descriptionText, {});

    const stream = true
    const openAiPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            // { role: ChatGPTAgent.system, content: systemPrompt },
            // { role: ChatGPTAgent.user, content: examplePrompt.input },
            // { role: ChatGPTAgent.assistant, content: examplePrompt.output },
            { role: 'user', content: userPrompt },
        ],
        // temperature: 0.5,
        // top_p: 1,
        // frequency_penalty: 0,
        // presence_penalty: 0,
        max_tokens: 800,
        stream,
        // n: 1,
    }

    const openaiApiKey = ``
    const result = await fetchOpenAIResult(openAiPayload, openaiApiKey, videoConfig)

    console.log(result)
})()