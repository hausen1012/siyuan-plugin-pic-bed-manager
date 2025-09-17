<template>
  <div class="plugin-app-main flex min-h-[500px]">
    <!-- 左侧导航 -->
    <div class="w-32 bg-gray-100 border-r rounded-l-2xl p-4">
      <ul class="space-y-2">
        <li v-for="tab in tabs" :key="tab.key">
          <button
            @click="activeTab = tab.key"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg',
              activeTab === tab.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </div>

    <!-- 右侧内容 -->
    <div class="flex-1 bg-white shadow-lg rounded-br-2xl p-6">
      <ImgBedConfig v-if="activeTab === 'imgBed'" />
      <CompressConfig v-else-if="activeTab === 'compress'" />
      <OtherConfig v-else-if="activeTab === 'other'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ImgBedConfig from "@/components/ImgBedConfig.vue"
import CompressConfig from "@/components/CompressConfig.vue"
import OtherConfig from "@/components/OtherConfig.vue"

const activeTab = ref<"imgBed" | "compress" | "other">("imgBed")

const tabs = [
  { key: "imgBed", label: "图床配置" },
  { key: "compress", label: "压缩配置" },
  { key: "other", label: "其他配置" },
]
</script>
