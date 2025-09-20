<template>
  <div class="container">
    <header class="header">
      <h2>压缩配置</h2>
    </header>

    <form @submit.prevent="saveConfig" class="form">
      <!-- API 地址 -->
      <label class="form-row">
        <span>API 地址：</span>
        <input type="text" v-model="form.apiUrl" placeholder="https://api.tinify.com/shrink" />
      </label>

      <!-- Api Key -->
      <label class="form-row">
        <span>Api Key：</span>
        <input type="text" v-model="form.apiKey" placeholder="获取地址：https://tinify.cn/dashboard/api" />
      </label>

      <!-- 启用 -->
      <label class="form-row switch-label">
        <span>全局启用：</span>
        <input type="checkbox" v-model="form.enable" />
        <span class="switch-slider"></span>
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
import { ref, onMounted } from "vue"
import { CompressConfig } from "@/interface/config"
import { useConfigStore } from "@/store/configStore"

const configStore = useConfigStore()

// 定义表单字段
const form = ref<CompressConfig>({
  apiUrl: "",
  apiKey: "",
  enable: false
})
const saved = ref(false)

async function saveConfig() {
  try {
    await configStore.saveField({ compressConfig: form.value })
    saved.value = true
   setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error("保存压缩配置失败", e)
  }
}

onMounted(async () => {
  try {
    const appConfig = await configStore.loadConfig()
    if (appConfig?.compressConfig) {
      form.value = appConfig.compressConfig
    }
  } catch {
    console.log("加载配置失败")
  }
})
</script>

<style scoped>
.container {
  height: 100%;
  margin: 0 auto;
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
}

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

/* 表单卡片 */
.form {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 水平排列的表单行 */
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.form-row span {
  min-width: 80px;
}

/* 输入框 */
input[type="text"] {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="text"]:focus {
  border-color: #1677ff;
  box-shadow: 0 0 4px rgba(22,119,255,0.2);
  outline: none;
}

/* 开关样式 */
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

/* 响应式优化 */
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row span {
    min-width: auto;
    margin-bottom: 4px;
  }
}
</style>
