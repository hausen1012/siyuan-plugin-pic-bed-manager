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
  /* overflow: hidden; */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 左侧导航 */
.sidebar {
  width: 140px;
  background-color: #f5f5f5;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 16px 24px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #e6f7ff;
}

.menu-item.active {
  background-color: #1890ff;
  color: white;
}

/* 右侧内容 */
.content {
  flex: 1;
  padding: 24px;
  background-color: white;
  border-bottom-right-radius: 12px;
}
</style>
