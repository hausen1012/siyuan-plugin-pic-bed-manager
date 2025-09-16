import { createApp } from 'vue';

export function getDomByVueComponent(component) {
  const div = document.createElement('div');
  const app = createApp(component);
  app.mount(div);
  return div;
}

// utils/domUtils.ts
export function getCaretNodeId(): string | null {
  // 获取光标所在节点
  let node = window.getSelection()?.getRangeAt(0).startContainer;

  // 如果是文本节点，取父元素
  if (node?.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
  }

  // 确保 node 是元素类型再调用 closest
  let parentWithId: HTMLElement | null = null;
  if (node instanceof Element) {
      parentWithId = node.closest('[data-node-id]');
  }

  // 返回 data-node-id
  return parentWithId?.dataset.nodeId ?? null;
}
