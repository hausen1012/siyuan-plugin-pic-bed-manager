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

export function generateId() {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
