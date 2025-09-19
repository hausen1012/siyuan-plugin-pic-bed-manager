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
import { loadConfig, saveConfigField } from "@/utils/configManager"
import { CompressConfig } from "@/interface/config"

// 定义表单字段
const form = ref<CompressConfig>({
  apiUrl: "",
  apiKey: "",
  enable: false
})
const saved = ref(false)

async function saveConfig() {
  try {
    await saveConfigField({ compressConfig: form.value })
    saved.value = true
   setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error("保存压缩配置失败", e)
  }
}

onMounted(async () => {
  try {
    const appConfig = await loadConfig()
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
}

/* 表单卡片 */
.form {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 水平排列的表单行 */
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #555;
}

.form-row span {
  min-width: 80px; /* 标签宽度，可根据需要调整 */
}

/* 输入框 */
input[type="text"] {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="text"]:focus {
  border-color: #1890ff;
  box-shadow: 0 0 4px rgba(24,144,255,0.3);
  outline: none;
}

/* 开关样式 */
.switch-label {
  gap: 8px;
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
  padding: 7px 14px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #f0f0f0;
}

.btn.primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn.primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
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
