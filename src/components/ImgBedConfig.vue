<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ImgBedConfig, LskyConfig, OtherConfig } from "@/interface/config"
import Client from "@/utils/siyuanSdk"
import { generateId } from "@/utils/common"
import { ImgBedType } from "@/constants/imgBedType"
import MultiSelect from "@/components/MultiSelect.vue"
import { useConfigStore } from "@/store/configStore"

const configStore = useConfigStore()

const mode = ref<"list" | "add" | "edit">("list")
const form = ref<Array<ImgBedConfig>>([])
const saved = ref(false)

const newImgBedType = ref<ImgBedType>(ImgBedType.Lsky)
const newImgBedConfig = ref<Partial<ImgBedConfig>>({ notebookIds: [] })
const editingBedId = ref<string | null>(null)
const notebookList = ref<{ label: string; value: string }[]>([])

async function persistConfig() {
  try {
    await configStore.saveField({ imgBedList: form.value })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e) {
    console.error(e)
    alert("保存失败")
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
    throw new Error(`不支持的图床类型: ${newImgBedType.value}`)
  }

  form.value.push(bed)
}

async function removeImgBed(id: string) {
  if (confirm("确认删除？删除后无法恢复")) {
    form.value = form.value.filter(bed => bed.id !== id)
    await persistConfig()
  }
}

onMounted(async () => {
  try {
    const appConfig = await configStore.loadConfig()
    form.value = Array.isArray(appConfig?.imgBedList) ? appConfig.imgBedList : []
    const response = await Client.lsNotebooks()
    notebookList.value = response.data.notebooks.map(nb => ({
      label: nb.name,
      value: nb.id,
    }))
  } catch {
    console.log("没有已有配置，使用默认值")
  }
})
</script>

<template>
  <div class="container">
    <!-- 列表界面 -->
    <div v-if="mode === 'list'">
      <header class="header">
        <h2>图床配置</h2>
        <button class="btn primary" @click="toAddMode">新增</button>
      </header>

      <ul class="list">
        <li v-for="item in form" :key="item.id" class="list-item">
          <div>
            <strong>名称:</strong> {{ item.name }}<br/>
            <strong>地址:</strong> {{ item.baseUrl }}
          </div>
          <div class="actions">
            <button class="btn" @click="toEditMode(item)">编辑</button>
            <button class="btn danger" @click="removeImgBed(item.id)">删除</button>
          </div>
        </li>
      </ul>
      <!-- 保存成功提示 -->
      <div v-if="saved" class="alert success">
        ✅ 配置已保存！
      </div>
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

          
          <!-- 笔记本选择 -->
          <!-- <div class="form-group">
            <label for="notebooks">绑定笔记本：</label>
            <select
              id="notebooks"
              v-model="newImgBedConfig.notebookIds"
              multiple
              class="select-multi"
            >
              <option
                v-for="nb in notebookList"
                :key="nb.value"
                :value="nb.value"
              >
                {{ nb.label }}
              </option>
            </select>
          </div> -->


          <!-- 操作按钮 -->
          <div class="form-actions">
            <button class="btn" @click="toListMode">返回</button>
            <button class="btn primary" @click="handleSaveBed">
              {{ mode === "add" ? "保存" : "更新" }}
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

/* 保存成功提示 */
.alert.success {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
  border-radius: 6px;
  text-align: center;
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

/* 响应式优化 */
@media (max-width: 600px) {
  .list-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    margin-top: 10px;
  }
}

</style>
