<template>
  <div class="multi-select-container" ref="containerRef" :class="{ 'is-focused': isFocused, 'is-open': isOpen }">
    <div class="multi-select-tags" @click="toggleDropdown">
      <div v-if="selectedOptions.length === 0" class="multi-select-placeholder">
        {{ placeholder }}
      </div>
      <div v-else class="multi-select-tag-list">
        <span
          v-for="item in selectedOptions"
          :key="item.value"
          class="multi-select-tag"
          @click.stop
        >
          {{ item.label }}
          <span class="multi-select-tag-close" @click="handleRemoveTag(item.value)">&times;</span>
        </span>
      </div>
    </div>

    <div v-if="isOpen" class="multi-select-dropdown">
      <ul class="multi-select-options">
        <li
          v-for="option in options"
          :key="option.value"
          class="multi-select-option"
          :class="{ 'is-selected': isOptionSelected(option.value) }"
          @click="handleOptionClick(option)"
        >
          {{ option.label }}
        </li>
      </ul>
      <div v-if="options.length === 0" class="multi-select-empty">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '请选择'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const isFocused = ref(false);
const containerRef = ref(null);

// 根据 modelValue 找出对应的 label
const selectedOptions = computed(() => {
  return props.options.filter(option => props.modelValue.includes(option.value));
});

// 检查某个选项是否已被选中
const isOptionSelected = (value) => {
  return props.modelValue.includes(value);
};

// 处理选项点击事件
const handleOptionClick = (option) => {
  const selectedValues = [...props.modelValue];
  const index = selectedValues.indexOf(option.value);

  if (index > -1) {
    // 已经选中，则取消选中
    selectedValues.splice(index, 1);
  } else {
    // 未选中，则选中
    selectedValues.push(option.value);
  }

  emit('update:modelValue', selectedValues);
};

// 处理标签移除事件
const handleRemoveTag = (value) => {
  const selectedValues = props.modelValue.filter(v => v !== value);
  emit('update:modelValue', selectedValues);
};

// 切换下拉菜单的显示状态
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  isFocused.value = isOpen.value;
};

// 点击组件外部时，关闭下拉菜单
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
    isFocused.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 当 modelValue 变化时，如果变成空数组，则取消聚焦状态
watch(() => props.modelValue, (newVal) => {
  if (newVal.length === 0) {
    isFocused.value = false;
  }
});

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
  display: -webkit-box; /* 启用弹性盒子布局 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  -webkit-line-clamp: 2; /* 限制为3行 */
  overflow: scroll; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  max-height: 78px; /* 设置最大高度以适应三行标签 */
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  transition: border-color 0.3s;
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
  margin-top: 6px;
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

.multi-select-empty {
  text-align: center;
  padding: 10px;
  color: #999;
}
</style>
