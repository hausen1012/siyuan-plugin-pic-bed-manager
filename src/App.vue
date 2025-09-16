<template>
  <div class="plugin-app-main flex justify-center items-center min-h-[400px]">
    <div class="bg-white shadow-lg rounded-2xl p-6 w-[420px]">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          图床地址
        </label>
        <SyInput
          v-model="form.baseUrl"
          placeholder="例如：https://lsky.example.com"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          邮箱
        </label>
        <SyInput v-model="form.email" placeholder="请输入邮箱" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          密码
        </label>
        <SyInput type="password" v-model="form.password" placeholder="请输入密码" />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          存储策略 ID
        </label>
        <SyInput type="number" v-model="form.strategyId" placeholder="默认 1，可选" />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          指定笔记本
        </label>
        <SySelect
          v-model="form.notebookId"
          :options="notebookList"
        />
      </div>

      <SyButton
        class="w-full bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition"
        @click="saveConfig"
      >
        保存配置
      </SyButton>

      <div
        v-if="saved"
        class="mt-4 text-green-600 text-center text-sm font-medium"
      >
        ✅ 配置已保存！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue"
import SyButton from "@/components/SiyuanTheme/SyButton.vue"
import SyInput from "@/components/SiyuanTheme/SyInput.vue"
import SySelect from "@/components/SiyuanTheme/SySelect.vue"
import { Plugin } from "siyuan"
import Client from "@/utils/sdk"
import { Config } from "@/interface"

const plugin = inject<Plugin>("plugin")
const configFile = inject<string>("configFile")

const form = ref<Config>({
  notebookId: "",
  baseUrl: "",
  email: "",
  password: "",
  strategyId: 1,
})

const notebookList = ref([])


const saved = ref(false)

async function saveConfig() {
  try {
    await plugin.saveData(configFile, form.value)
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error("保存失败", e)
  }
}

onMounted(async () => {
  try {
    // 读取数据，如果不存在就用默认配置
    const data = await plugin.loadData(configFile)
    form.value = data ?? form.value

    Client.lsNotebooks().then(response => {
      notebookList.value = response.data.notebooks.map(nb => ({
        text: nb.name, 
        value: nb.id
      }))
    })
  } catch {
    console.log("没有已有配置，使用默认值")
  }
})
</script>
