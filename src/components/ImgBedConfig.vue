<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ImgBedConfig, LskyConfig, OtherConfig } from "@/types/config"
import { SelectItem } from "@/types/components"
import Client from "@/utils/siyuanSdk"
import { generateId } from "@/utils/common"
import { ImgBedType } from "@/constants/imgBedType"
import MultiSelect from "@/components/MultiSelect.vue"
import { useConfigStore } from "@/store/configStore"
import { Mode } from "@/constants/mode"

const configStore = useConfigStore()

const mode = ref<Mode>(Mode.LIST)
const form = ref<Array<ImgBedConfig>>([])

const newImgBedType = ref<ImgBedType>(ImgBedType.Lsky)
const newImgBedConfig = ref<Partial<ImgBedConfig>>({ notebookIds: [] })
const editingBedId = ref<string | null>(null)
const notebookList = ref<Array<SelectItem>>([])
const disabledNotebookIds = ref<string[]>([])


async function persistConfig() {
  try {
    await configStore.saveField({ imgBedList: form.value })
    window.$message.info("操作成功")
  } catch (e) {
    console.error(e)
    window.$message.error("操作失败")
  }
}

function toAddMode() {
  newImgBedConfig.value = { notebookIds: [] }
  newImgBedType.value = ImgBedType.Lsky
  editingBedId.value = null
  computeDisabledNotebooks()
  mode.value = Mode.ADD
}

function toEditMode(bed: ImgBedConfig) {
  newImgBedConfig.value = { ...bed }
  newImgBedType.value = bed.type as ImgBedType
  editingBedId.value = bed.id
  computeDisabledNotebooks(bed.id)
  mode.value = Mode.EDIT
}

function toListMode() {
  newImgBedConfig.value = { notebookIds: [] }
  newImgBedType.value = ImgBedType.Lsky
  editingBedId.value = null
  mode.value = Mode.LIST
}

async function handleSaveBed() {
  if (!newImgBedConfig.value.name || !newImgBedConfig.value.baseUrl) {
    window.$message.error("请填写图床配置完整信息")
    return
  }

  if (mode.value === Mode.ADD) {
    const id = generateId()
    pushBed({ ...newImgBedConfig.value, id })
  } else if (mode.value === Mode.EDIT && editingBedId.value) {
    const index = form.value.findIndex(b => b.id === editingBedId.value)
    if (index !== -1) {
      form.value[index] = {
        ...form.value[index],
        ...newImgBedConfig.value,
        id: editingBedId.value,
        token: "",
      } as ImgBedConfig
    }
  }

  await persistConfig()
  toListMode()
}

function pushBed(raw: Partial<ImgBedConfig>) {
  // 公共字段
  const common = {
    id: raw.id!,
    name: raw.name!,
    notebookIds: raw.notebookIds!,
    enableCompress: raw.enableCompress,
    defaultImgBed: raw.defaultImgBed,
    baseUrl: raw.baseUrl!,
  }

  let bed: ImgBedConfig

  if (newImgBedType.value === ImgBedType.Lsky) {
    bed = {
      ...common,
      type: ImgBedType.Lsky,
      email: (raw as LskyConfig).email!,
      password: (raw as LskyConfig).password!,
      strategyId: (raw as LskyConfig).strategyId ?? 1,
    }
  } else if (newImgBedType.value === ImgBedType.EasyImg) {
    bed = {
      ...common,
      type: ImgBedType.EasyImg,
      token: (raw as OtherConfig).token!,
    }
  } else {
    window.$message.error(`不支持的图床类型: ${newImgBedType.value}`)
    console.log(`不支持的图床类型: ${newImgBedType.value}`)
  }

  form.value.push(bed)
}

async function removeImgBed(id: string) {
  form.value = form.value.filter(bed => bed.id !== id)
  await persistConfig()
}

function getNotebookNames(ids) {
  if (!ids || ids.length === 0) return '-'
  return ids
    .map(id => notebookList.value.find(nb => nb.value === id)?.name || '未知')
    .join('，')
}

function computeDisabledNotebooks(currentBedId?: string) {
  const ids: string[] = []

  form.value.forEach(bed => {
    // 如果是当前编辑的图床，则跳过它自己的 notebook
    if (currentBedId && bed.id === currentBedId) return
    ids.push(...bed.notebookIds)
  })

  disabledNotebookIds.value = ids
}

// 加载：1. 笔记本列表 2. 插件配置
onMounted(async () => {
  try {
    const response = await Client.lsNotebooks()
    notebookList.value = response.data.notebooks.map(nb => ({
      name: nb.name,
      value: nb.id,
    }))

    const existingNotebookIds = new Set(notebookList.value.map(nb => nb.value))
    const appConfig = await configStore.loadConfig()
    form.value = Array.isArray(appConfig?.imgBedList)
      ? appConfig.imgBedList.map(imgBed => ({
          ...imgBed,
          notebookIds: Array.isArray(imgBed.notebookIds)
            ? imgBed.notebookIds.filter(id => existingNotebookIds.has(id))
            : [],
        }))
      : []
  } catch {
    console.log("没有已有配置，使用默认值")
  }
})
</script>

<template>
  <div class="container">
    <!-- 列表界面 -->
    <div v-if="mode === Mode.LIST">
      <header class="header">
        <h2>图床配置</h2>
        <button class="btn primary" @click="toAddMode">新增</button>
      </header>

      <ul class="list">
        <li v-for="item in form" :key="item.id" class="list-item">
          <div>
            <strong>名称: </strong>{{ item.name }}<br/>
            <strong>地址: </strong>{{ item.baseUrl }}<br/>
            <strong>笔记本: </strong>
            <span 
              class="notebook-preview" 
              :title="getNotebookNames(item.notebookIds)"
            >
              {{ getNotebookNames(item.notebookIds) }}
            </span>
          </div>
          <div class="actions">
            <button class="btn" @click="toEditMode(item)">编辑</button>
            <button class="btn danger" @click="removeImgBed(item.id)">删除</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- 新增/编辑界面 -->
    <div v-else>
      <div class="card">
        <div class="form">
          <!-- 图床类型 -->
          <label>
            <span>图床类型: </span>
            <select v-model="newImgBedType">
              <option :value="ImgBedType.Lsky">兰空图床</option>
              <option :value="ImgBedType.EasyImg">简单图床</option>
            </select>
          </label>

          
          <label>
            <span>绑定笔记：</span>
            <MultiSelect
              v-model="newImgBedConfig.notebookIds"
              :options="notebookList"
              :disabledList="disabledNotebookIds"
              placeholder="请绑定笔记本"
            />
          </label>

          <!-- 名称 -->
          <label>
            <span>图床名称：</span>
            <input type="text" v-model="newImgBedConfig.name" placeholder="请输入图床名称" />
          </label>

          <!-- Lsky 配置 -->
          <div v-if="newImgBedType === ImgBedType.Lsky">
            <label>
              <span>图床地址：</span>
              <input type="text" v-model="newImgBedConfig.baseUrl" placeholder="请输入图床地址" />
            </label>
            <label>
              <span>邮箱：</span>
              <input type="email" v-model="newImgBedConfig.email" placeholder="请输入邮箱" />
            </label>
            <label>
              <span>密码：</span>
              <input type="password" v-model="newImgBedConfig.password" placeholder="请输入密码" />
            </label>
            <label>
              <span>策略ID：</span>
              <input type="number" v-model.number="newImgBedConfig.strategyId" placeholder="请输入策略ID" />
            </label>
          </div>

          <!-- 其他图床配置 -->
          <div v-else>
            <label>
              <span>图床地址：</span>
              <input type="text" v-model="newImgBedConfig.baseUrl" placeholder="请输入图床地址"/>
            </label>
            <label>
              <span>Token：</span>
              <input type="text" v-model="newImgBedConfig.token" placeholder="请输入Token"/>
            </label>
          </div>
          
          <!-- 上传压缩 -->
          <label class="form-row switch-label">
            <span>上传压缩：</span>
            <input type="checkbox" v-model="newImgBedConfig.enableCompress" />
          </label>

          <!-- 默认图床 -->
          <label class="form-row switch-label">
            <span>默认图床：</span>
            <input type="checkbox" v-model="newImgBedConfig.defaultImgBed" />
          </label>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button class="btn" @click="toListMode">返回</button>
            <button class="btn primary" @click="handleSaveBed">
              {{ mode === Mode.ADD ? "保存" : "更新" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  margin: 0 auto;
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
}

/* 标题头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

/* 列表 */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.list-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.08);
}

.actions button {
  margin-left: 8px;
}

/* 卡片/表单 */
.card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.card h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  border-left: 3px solid #1677ff;
  padding-left: 8px;
  color: #222;
}

.notebook-preview {
  display: inline-block;
  max-width: 350px; /* 根据你需要调整宽度 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  cursor: help; /* 鼠标悬浮显示 title */
}

.form label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #555;
}

.form span {
  min-width: 80px;
}

.form input,
.form select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form input:focus,
.form select:focus {
  border-color: #1677ff;
  box-shadow: 0 0 4px rgba(22,119,255,0.2);
  outline: none;
}

.form input[type="checkbox"] {
  margin-top: 0;
}

.switch-label {
  gap: 8px;
  display: flex;
  align-items: center;
}

.switch-label input[type="checkbox"] {
  width: 36px;
  height: 18px;
  -webkit-appearance: none;
  background: #ccc;
  outline: none;
  border-radius: 18px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.switch-label input[type="checkbox"]:checked {
  background: #1677ff;
}

.switch-label input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
}

.switch-label input[type="checkbox"]:checked::before {
  transform: translateX(18px);
}

/* 按钮样式 */
.btn {
  margin-left: 8px;
  padding: 6px 14px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #444;
  transition: all 0.2s ease;
}

.btn:hover {
  border-color: #999;
  background: #fafafa;
}

/* 主操作按钮 */
.btn.primary {
  border-color: #1677ff;
  color: #1677ff;
  background: #fff;
}

.btn.primary:hover {
  background: #e6f0ff;
}

/* 危险按钮 */
.btn.danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background: #fff;
}

.btn.danger:hover {
  background: #fff1f0;
}

/* 底部操作栏 */
.form-actions {
  margin-top: 10px;
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  position: sticky;
  bottom: 0;
}
</style>
