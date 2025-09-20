<template>
  <div class="multi-select-container" ref="containerRef" :class="{ 'is-focused': isFocused, 'is-open': isOpen }">
    <!-- 标签区域 -->
    <div class="multi-select-tags" @click="toggleDropdown">
      <div v-if="selectedOptions.length === 0" class="multi-select-placeholder">
        {{ placeholder }}
      </div>
      <div v-else class="multi-select-tag-list">
        <span
          v-for="item in selectedOptions"
          :key="item.value"
          class="multi-select-tag"
        >
          {{ item.name }}
          <span class="multi-select-tag-close" @click.stop="handleRemoveTag(item.value)">&times;</span>
        </span>
      </div>
    </div>

    <!-- 下拉列表 -->
    <div v-if="isOpen" class="multi-select-dropdown">
      <ul class="multi-select-options">
        <li
          v-for="option in options"
          :key="option.value"
          class="multi-select-option"
          :class="{ 
            'is-selected': isOptionSelected(option.value),
            'is-disabled': isOptionDisabled(option.value)
          }"
          @click="handleOptionClick(option)"
        >
          {{ option.name }}
        </li>
      </ul>
      <div v-if="options.length === 0" class="multi-select-empty">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { SelectItem } from '@/types/components'

const props = defineProps<{
  modelValue: string[]
  options: SelectItem[]
  placeholder?: string
  disabledList?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const isOpen = ref(false)
const isFocused = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedOptions = computed(() =>
  props.options.filter(option => props.modelValue.includes(option.value))
)

const isOptionSelected = (value: string) => props.modelValue.includes(value)
const isOptionDisabled = (value: string) => props.disabledList?.includes(value) ?? false

const handleOptionClick = (option: SelectItem) => {
  if (isOptionDisabled(option.value)) return

  const selectedValues = [...props.modelValue]
  const index = selectedValues.indexOf(option.value)
  if (index > -1) {
    selectedValues.splice(index, 1)
  } else {
    selectedValues.push(option.value)
  }
  emit('update:modelValue', selectedValues)
}

const handleRemoveTag = (value: string) => {
  const selectedValues = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', selectedValues)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  isFocused.value = isOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
    isFocused.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

watch(
  () => props.modelValue,
  newVal => {
    if (newVal.length === 0) isFocused.value = false
  }
)
</script>

<style scoped>
.multi-select-container {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.multi-select-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 78px;
  padding: 8px;
  line-height: 18px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  transition: border-color 0.3s;
  overflow-y: auto;
}

.multi-select-container.is-focused .multi-select-tags {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.multi-select-placeholder {
  color: #c0c4cc;
}

.multi-select-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.multi-select-tag {
  display: flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  color: #303133;
  font-size: 12px;
}

.multi-select-tag-close {
  cursor: pointer;
  margin-left: 6px;
  font-size: 14px;
  line-height: 1;
  color: #909399;
  transition: color 0.3s;
}

.multi-select-tag-close:hover {
  color: #409eff;
}

.multi-select-dropdown {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999;
  box-sizing: border-box;
}

.multi-select-options {
  list-style: none;
  padding: 6px 0;
  margin: 0;
}

.multi-select-option {
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  transition: background-color 0.3s;
}

.multi-select-option:hover {
  background-color: #f5f7fa;
}

.multi-select-option.is-selected {
  color: #409eff;
  background-color: #f5f7fa;
  font-weight: 500;
}

.multi-select-option.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  pointer-events: none;
  background-color: #f5f5f5;
}

.multi-select-empty {
  text-align: center;
  padding: 10px;
  color: #999;
}
</style>
