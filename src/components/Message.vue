<template>
  <transition name="fade">
    <div v-if="visible" class="message" :class="type">
      {{ text }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from "vue"

const visible = ref(false)
const text = ref("")
const type = ref<"success" | "error" | "info">("info")

function show(msg: string, t: typeof type.value = "info", duration = 2000) {
  text.value = msg
  type.value = t
  visible.value = true
  setTimeout(() => (visible.value = false), duration)
}

// 暴露方法给外面调用
defineExpose({ show })
</script>

<style scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 9999;
}
.message.success { background: #52c41a; }
.message.error { background: #ff4d4f; }
.message.info { background: #1677ff; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
