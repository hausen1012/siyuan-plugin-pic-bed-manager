// src/utils/configManager.ts
import type { Plugin } from "siyuan"
import type { AppConfig } from "@/interface/config"
import { CONFIG_FILE } from "@/constants/plugin"

// 内存缓存
let cachedConfig: AppConfig | null = null
let registeredPlugin: Plugin | null = null

/**
 * 注册 Plugin 实例（通常在插件启动时调用一次）
 */
export function registerPlugin(plugin: Plugin) {
  console.log("插件实例注册成功")
  registeredPlugin = plugin
}

/**
 * 加载配置，只在第一次或强制刷新时从 plugin 读取
 */
export async function loadConfig(forceReload = false): Promise<AppConfig> {
  if (!registeredPlugin) {
    throw new Error("Plugin 未注册")
  }

  if (cachedConfig && !forceReload) {
    return cachedConfig
  }

  const data = (await registeredPlugin.loadData(CONFIG_FILE)) || {}
  cachedConfig = data as AppConfig
  return cachedConfig
}

/**
 * 保存配置字段，并更新内存缓存和 plugin
 */
export async function saveConfigField(fieldConfig: Partial<AppConfig>) {
  if (!registeredPlugin) {
    throw new Error("Plugin 未注册")
  }

  const current = await loadConfig()
  const updatedConfig = { ...current, ...fieldConfig }

  cachedConfig = updatedConfig
  await registeredPlugin.saveData(CONFIG_FILE, updatedConfig)
}

/**
 * 清空内存缓存（可选，用于插件卸载或重新加载）
 */
export function clearConfigCache() {
  cachedConfig = null
}
