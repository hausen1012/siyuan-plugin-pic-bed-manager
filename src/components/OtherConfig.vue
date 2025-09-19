<template>
  <div class="container">
    <h4>其他配置</h4>

    <form @submit.prevent="saveConfig" class="form">
      <!-- 示例开关 -->
      <label class="switch-label">
        示例开关：
        <input type="checkbox" v-model="form.exampleSwitch" />
        <span class="switch-slider"></span>
      </label>

      <!-- 备注信息 -->
      <label>
        备注信息：
        <textarea v-model="form.notes" placeholder="输入备注..." rows="4"></textarea>
      </label>

      <!-- 保存按钮 -->
      <button type="submit" class="btn primary">保存配置</button>
    </form>

    <!-- 保存成功提示 -->
    <div v-if="saved" class="alert success">
      ✅ 配置已保存！
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue"
import { loadConfig, saveConfigField } from "@/utils/configManager"

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
    const allConfig = (await plugin?.loadData(configFile)) || {}
    allConfig.other = form.value
    await plugin?.saveData(configFile, allConfig)
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error("保存失败", e)
    alert("保存失败")
  }
}

onMounted(async () => {
  try {
    const data = await plugin?.loadData(configFile)
    if (data?.other) {
      form.value = data.other
    }
  } catch {
    console.log("没有已有其他配置，使用默认值")
  }
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  font-family: Arial, sans-serif;
}

h4 {
  margin-bottom: 16px;
}

/* 表单样式 */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}

textarea {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

/* 开关样式 */
.switch-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.switch-label input[type="checkbox"] {
  width: 40px;
  height: 20px;
  -webkit-appearance: none;
  background: #ccc;
  outline: none;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.switch-label input[type="checkbox"]:checked {
  background: #1890ff;
}

.switch-label input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
}

.switch-label input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
  font-weight: 500;
}

.btn.primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 成功提示 */
.alert.success {
  margin-top: 16px;
  padding: 8px 12px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
  border-radius: 4px;
  text-align: center;
}
</style>
