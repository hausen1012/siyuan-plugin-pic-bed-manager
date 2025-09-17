<template>
  <div>
    <h2 class="text-lg font-medium mb-4">其他配置</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">示例开关</label>
        <input type="checkbox" v-model="form.exampleSwitch" class="w-4 h-4" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">备注信息</label>
        <textarea v-model="form.notes" placeholder="输入备注..." class="input"></textarea>
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

interface OtherConfig {
  exampleSwitch: boolean
  notes: string
}

const plugin = inject<Plugin>("plugin")
const configFile = inject<string>("configFile")

const form = ref<OtherConfig>({
  exampleSwitch: false,
  notes: ""
})
const saved = ref(false)

async function saveConfig() {
  try {
    const allConfig = await plugin.loadData(configFile) || {}
    allConfig.other = form.value
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
    if (data?.other) {
      form.value = data.other
    }
  } catch {
    console.log("没有已有其他配置，使用默认值")
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
