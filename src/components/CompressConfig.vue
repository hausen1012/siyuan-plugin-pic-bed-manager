<template>
  <div>
    <h2 class="text-lg font-medium mb-4">压缩配置</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">API 地址</label>
        <input v-model="form.apiUrl" type="text" placeholder="https://example.com/api" class="input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Token</label>
        <input v-model="form.token" type="text" placeholder="输入 Token" class="input" />
      </div>

      <div class="flex items-center gap-2">
        <input id="enable" type="checkbox" v-model="form.enabled" class="w-4 h-4" />
        <label for="enable" class="text-sm text-gray-700">启用压缩功能</label>
      </div>

      <button @click="saveConfig" class="w-full bg-green-600 text-white rounded-xl py-2 hover:bg-green-700 transition">
        保存配置
      </button>
    </div>

    <div v-if="saved" class="mt-4 text-green-600 text-center text-sm font-medium">
      ✅ 配置已保存！
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue"
import { Plugin } from "siyuan"

interface CompressConfig {
  apiUrl: string
  token: string
  enabled: boolean
}

const plugin = inject<Plugin>("plugin")
const configFile = inject<string>("configFile")

const form = ref<CompressConfig>({
  apiUrl: "",
  token: "",
  enabled: false
})
const saved = ref(false)

async function saveConfig() {
  try {
    const allConfig = await plugin.loadData(configFile) || {}
    allConfig.compress = form.value
    await plugin.saveData(configFile, allConfig)
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error("保存失败", e)
  }
}

onMounted(async () => {
  try {
    const data = await plugin.loadData(configFile)
    if (data?.compress) {
      form.value = data.compress
    }
  } catch {
    console.log("没有已有压缩配置，使用默认值")
  }
})
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  outline: none;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
</style>
