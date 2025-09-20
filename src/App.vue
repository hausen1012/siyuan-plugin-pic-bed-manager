<template>
  <div class="app-container">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['menu-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="content">
      <ImgBedConfig v-if="activeTab === 'imgBed'" />
      <CompressConfig v-else-if="activeTab === 'compress'" />
      <!-- <OtherConfig v-else-if="activeTab === 'other'" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ImgBedConfig from "@/components/ImgBedConfig.vue"
import CompressConfig from "@/components/CompressConfig.vue"
// import OtherConfig from "@/components/OtherConfig.vue"

const activeTab = ref<"imgBed" | "compress" | "other">("imgBed")

const tabs = [
  { key: "imgBed", label: "图床配置" },
  { key: "compress", label: "压缩配置" },
  // { key: "other", label: "其他配置" },
]
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 600px;
  background: #f9f9f9;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* 左侧导航 */
.sidebar {
  width: 140px;
  background-color: #F6F6F6;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #555;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #f0f5ff;
}

.menu-item.active {
  background-color: #E4E4E4;
  color: #000;
  font-weight: 500;
}

/* 右侧内容 */
.content {
  flex: 1;
  padding: 24px;
  background-color: #fff;
  border-left: 1px solid #eee;
  overflow-y: auto;
}

/* 响应式优化 */
@media (max-width: 700px) {
  .app-container {
    flex-direction: column;
    border-radius: 0;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }

  .menu-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
  }

  .content {
    padding: 16px;
  }
}
</style>
