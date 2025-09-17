<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ImgBedConfig, LskyConfig, OtherConfig } from "@/interface/config"
import Client from "@/utils/sdk"
import { generateId } from "@/utils"
import { loadConfig, saveConfigField } from "@/utils/configManager"
import { ImgBedType } from "@/constants/imgBedType"


const mode = ref<"list" | "add" | "edit">("list")
const form = ref<Array<ImgBedConfig>>([])
const saved = ref(false)

// 使用枚举类型
const newImgBedType = ref<ImgBedType>(ImgBedType.Lsky)
const newImgBedConfig = ref<Partial<ImgBedConfig>>({ notebookIds: [] })
const editingBedId = ref<string | null>(null)
const notebookList = ref<{ text: string; value: string }[]>([])

async function persistConfig() {
  try {
    await saveConfigField({ imgBedList: form.value })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e) {
    console.error("保存失败", e)
  }
}

function toAddMode() {
  newImgBedConfig.value = { notebookIds: [] }
  newImgBedType.value = ImgBedType.Lsky
  editingBedId.value = null
  mode.value = "add"
}

function toEditMode(bed: ImgBedConfig) {
  newImgBedConfig.value = { ...bed }
  newImgBedType.value = bed.type as ImgBedType
  editingBedId.value = bed.id
  mode.value = "edit"
}

function toListMode() {
  newImgBedConfig.value = { notebookIds: [] }
  newImgBedType.value = ImgBedType.Lsky
  editingBedId.value = null
  mode.value = "list"
}

async function handleSaveBed() {
  // 需要根据类型校验
  if (!newImgBedConfig.value.name || !newImgBedConfig.value.baseUrl) {
    alert("请填写图床配置完整信息")
    return
  }

  if (mode.value === "add") {
    const id = generateId()
    pushBed({ ...newImgBedConfig.value, id })
  } else if (mode.value === "edit" && editingBedId.value) {
    const index = form.value.findIndex(b => b.id === editingBedId.value)
    if (index !== -1) {
      form.value[index] = {
        ...form.value[index],
        ...newImgBedConfig.value,
        id: editingBedId.value,
      } as ImgBedConfig
    }
  }

  await persistConfig()
  toListMode()
}

function pushBed(raw: Partial<ImgBedConfig>) {
  let bed: ImgBedConfig
  if (newImgBedType.value === ImgBedType.Lsky) {
    bed = {
      id: raw.id!,
      type: ImgBedType.Lsky,
      name: raw.name!,
      notebookIds: raw.notebookIds!,
      baseUrl: raw.baseUrl!,
      email: (raw as LskyConfig).email!,
      password: (raw as LskyConfig).password!,
      strategyId: (raw as LskyConfig).strategyId ?? 1,
    }
  } else {
    bed = {
      id: raw.id!,
      type: ImgBedType.Other,
      name: raw.name!,
      notebookIds: raw.notebookIds!,
      baseUrl: raw.baseUrl!,
      token: (raw as OtherConfig).token!,
    }
  }
  form.value.push(bed)
}

async function removeImgBed(id: string) {
  form.value = form.value.filter(bed => bed.id !== id)
  await persistConfig()
}

onMounted(async () => {
  try {
    const appConfig = await loadConfig()
    form.value = Array.isArray(appConfig?.imgBedList) ? appConfig.imgBedList : []
    const response = await Client.lsNotebooks()
    notebookList.value = response.data.notebooks.map(nb => ({
      text: nb.name,
      value: nb.id,
    }))
  } catch {
    console.log("没有已有配置，使用默认值")
  }
})
</script>

<template>
  <div>
    <!-- 列表界面 -->
    <div v-if="mode === 'list'" class="space-y-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">图床配置</h2>
        <button
          @click="toAddMode"
          class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
        >
          新增
        </button>
      </div>

      <ul class="space-y-2">
        <li
          v-for="bed in form"
          :key="bed.id"
          class="p-4 border rounded-xl flex justify-between items-center"
        >
          <div>
            <p class="font-medium">
              名称: {{ bed.name }}
            </p>
            <p class="text-sm text-gray-500">
              地址: {{ bed.baseUrl }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="toEditMode(bed)"
              class="text-blue-600 hover:underline"
            >
              编辑
            </button>
            <button
              @click="removeImgBed(bed.id)"
              class="text-red-600 hover:underline"
            >
              删除
            </button>
          </div>
        </li>
      </ul>

      <div
        v-if="saved"
        class="mt-4 text-green-600 text-center text-sm font-medium"
      >
        ✅ 配置已保存！
      </div>
    </div>

    <!-- 新增/编辑界面 -->
    <div
      v-else-if="mode === 'add' || mode === 'edit'"
      class="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg"
    >
      <div class="space-y-4">
        <!-- 图床类型 -->
        <div>
          <select
            v-model="newImgBedType"
            class="mt-1 w-full border rounded-lg px-3 py-2"
          >
            <option :value="ImgBedType.Lsky">兰空图床</option>
            <option :value="ImgBedType.Other">其他图床</option>
          </select>
        </div>

        <!-- 名称 -->
        <input
          v-model="newImgBedConfig.name"
          type="text"
          placeholder="图床名称"
          class="input"
        />

        <!-- Lsky 配置 -->
        <div v-if="newImgBedType === ImgBedType.Lsky" class="space-y-3">
          <input v-model="newImgBedConfig.baseUrl" type="text" placeholder="图床地址" class="input" />
          <input v-model="newImgBedConfig.email" type="email" placeholder="邮箱" class="input" />
          <input v-model="newImgBedConfig.password" type="password" placeholder="密码" class="input" />
          <input v-model.number="newImgBedConfig.strategyId" type="number" placeholder="策略ID" class="input" />
        </div>

        <!-- 其他图床配置 -->
        <div v-else-if="newImgBedType === ImgBedType.Other" class="space-y-3">
          <input v-model="newImgBedConfig.baseUrl" type="text" placeholder="图床地址" class="input" />
          <input v-model="newImgBedConfig.token" type="text" placeholder="Token" class="input" />
        </div>

        <!-- 笔记本选择（API 获取） -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">绑定笔记本</label>
          <div class="flex flex-col gap-2 max-h-40 overflow-auto border rounded-lg p-2 bg-gray-50">
            <label
              v-for="nb in notebookList"
              :key="nb.value"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="nb.value"
                v-model="newImgBedConfig.notebookIds"
                class="w-4 h-4"
              />
              <span>{{ nb.text }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="toListMode"
          class="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
        >
          返回
        </button>
        <button
          @click="handleSaveBed"
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          {{ mode === 'add' ? '保存' : '更新' }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.input {
  @apply w-full border rounded-lg px-3 py-2;
}
.input:focus {
  @apply border-blue-500 ring-2 ring-blue-200;
}
</style>
