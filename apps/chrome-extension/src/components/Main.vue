<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { OpenAIClient, Summarize, splitPrefixInclusive, Settings } from '@node-gptcommit/summarize'

defineProps<{ msg: string }>()

const tabKey = ref('main')
const loading = ref(false)

const localSetting = localStorage.getItem('setting')
const setting = localSetting
    ? JSON.parse(localSetting)
    : {
          apikey: '',
          type: '1', // 1:公开 , 2: 自建
          gitWeb: '1', // 1: github, 2: gitee
          gitApi: '', // 获取git仓库 diff的api
          proxy: 'https://api.openai.com', // openai代理地址
      }
const result = ref('') // 生成的结果

const successTip = (msg: string) => {
    ElMessage({
        message: msg,
        type: 'success',
        showClose: true,
    })
}

const errorTip = (msg: string) => {
    ElMessage({
        message: msg,
        type: 'error',
        showClose: true,
    })
}
const form = reactive(setting)

const getGitApi = () => {
    chrome &&
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any) {
            var tab = tabs[0]
            var url = new URL(tab.url)
            const hostname = url.hostname
            if (hostname.indexOf('github.com') >= 0 || hostname.indexOf('gitee.com') >= 0) {
                form.type = '1'
                if (hostname.indexOf('github.com') >= 0) {
                    form.gitWeb = '1'
                    if (url.pathname.indexOf('pull') >= 0) {
                        form.gitApi = `https://github.com${url.pathname}.diff`
                    } else if (url.pathname.indexOf('commit') >= 0) {
                        form.gitApi = `https://github.com${url.pathname}/commit/${url.searchParams.get('commit')}.diff`
                    }
                } else {
                    if (url.pathname.indexOf('pulls') >= 0) {
                        form.gitApi = `https://gitee.com${url.pathname}.diff`
                    }
                    form.gitWeb = '2'
                }
            } else {
                form.type = '2'
                if (url.pathname.indexOf('merge_requests') >= 0) {
                    form.gitApi = `${url.href}.diff`
                }
            }
        })
}
getGitApi()

const onSave = () => {
    successTip('保存成功~')
    localStorage.setItem('setting', JSON.stringify(form))
}

// 调用插件自动生成
const autoGet = () => {
    getGitApi()
    if (!form.apikey) {
        errorTip('🤖 请先填写openai的apiKey')
        return
    }
    if (!form.gitApi) {
        if (form.type == '1') {
            errorTip('🤖 请先打开github或者gitee的pull request或者commit页面')
            return
        }
        errorTip('🤖 请先填写gitdiff的api地址')
        return
    }
    onSave()
    loading.value = true
    fetch(setting.gitApi)
        .then((res) => {
            return res.text()
        })
        .then((text) => {
            const diffOutput = text
            const diffArray = splitPrefixInclusive(diffOutput, '\ndiff --git ')
            console.log('diffArray', diffArray)
            const client = OpenAIClient.getInstance(form.apikey)
            console.log('client', client)
            try {
                client.chatCompletions('Hello world')
            } catch (err) {
                ElMessage({
                    message: '🤖 无法访问openai，请检查网络或者apiKey是否正确',
                    type: 'error',
                })
            }
            const settings = new Settings()
            setting.allowAmend = true
            settings.isBrowser = true
            const summarizeClient = new Summarize(settings, client)
            console.log('summarizeClient', summarizeClient)
            return summarizeClient.getCommitMessage(diffArray)
        })
        .then((commitMessage) => {
            console.log('commitMessage', commitMessage)
            result.value = commitMessage
        })
        .catch((err) => {
            console.log('err', err)
            errorTip('🤖 生成失败，请检查网络或者apiKey是否正确')
        })
        .finally(() => {
            loading.value = false
        })
}

const back = () => {
    result.value = ''
}

const copy = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(result.value)
    } else {
        // 创建输入框
        var textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        // 隐藏此输入框
        textarea.style.position = 'absolute'
        textarea.style.clip = 'rect(0 0 0 0)'
        // 赋值
        textarea.value = result.value
        // 选中
        textarea.select()
        // 复制
        document.execCommand('copy', true)
    }

    successTip('复制成功~')
}
</script>

<template>
    <el-form :model="form" label-width="220px" label-position="top">
        <el-tabs tab-position="top" type="border-card" v-model="tabKey" style="height: auto">
            <el-tab-pane label="主窗口" name="main">
                <el-skeleton style="width: 240px" :loading="loading" animated>
                    <template v-if="result == ''">
                        <el-form-item label="git模式">
                            <el-radio-group v-model="form.type" class="ml-4">
                                <el-radio label="1">公开git</el-radio>
                                <el-radio label="2">自建git</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="公开git" v-if="form.type == '1'">
                            <el-radio-group v-model="form.gitWeb" class="ml-4">
                                <el-radio label="1">github</el-radio>
                                <el-radio label="2">gitee</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="自建git API" v-if="form.type == '2'">
                            <el-input v-model="form.gitApi" placeholder="请输入自建git获取gitdiff api地址" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="autoGet">自动生成</el-button>
                        </el-form-item>
                    </template>
                    <el-result icon="success" title="生成结果如下：" :sub-title="result" v-if="result != ''">
                        <template #sub-title>
                            <el-input v-model="result" autosize type="textarea" readonly />
                        </template>
                        <template #extra>
                            <el-button type="primary" @click="back">Back</el-button>
                            <el-button @click="copy">复制</el-button>
                        </template>
                    </el-result>
                </el-skeleton>
            </el-tab-pane>
            <el-tab-pane label="设置" name="setting">
                <el-form-item label="OpenAI API密钥">
                    <el-input
                        v-model="form.apikey"
                        type="password"
                        placeholder="请输入chatgpt的api密钥"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="openai代理地址">
                    <el-input v-model="form.proxy" placeholder="请输入openai代理地址" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSave">保存</el-button>
                </el-form-item>
            </el-tab-pane>
        </el-tabs>
    </el-form>
</template>

<style scoped></style>
