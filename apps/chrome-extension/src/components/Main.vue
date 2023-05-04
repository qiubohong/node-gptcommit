<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const test = () => {
    // chrome.runtime.sendMessage(
    //     {
    //         type: 'fetch',
    //         url: 'https://www.fastmock.site/mock/280be6cd819de83717a6ae33bdbbda0c/test/testapi',
    //     },
    //     (response) => {
    //         console.log(response)
    //     },
    // )
}
</script>

<template>
    <div>
        <t-button block @click="test">确定</t-button>
    </div>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
