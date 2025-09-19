// src/store/configStore.ts
import type { Plugin } from "siyuan"
import type { AppConfig } from "@/interface/config"
import { CONFIG_FILE } from "@/constants/plugin"

/**
 * Config Store 内部类
 */
class ConfigStore {
  private cachedConfig: AppConfig | null = null
  private plugin: Plugin | null = null

  init(plugin: Plugin) {
    if (this.plugin) return
    this.plugin = plugin
    console.log("ConfigStore 已初始化")
  }

  async loadConfig(forceReload = false): Promise<AppConfig> {
    if (!this.plugin) throw new Error("ConfigStore 未初始化，请先调用 init(plugin)")
    if (this.cachedConfig && !forceReload) return this.cachedConfig
    const data = (await this.plugin.loadData(CONFIG_FILE)) || {}
    this.cachedConfig = data as AppConfig
    return this.cachedConfig
  }

  async saveField(fieldConfig: Partial<AppConfig>) {
    if (!this.plugin) throw new Error("ConfigStore 未初始化，请先调用 init(plugin)")
    const current = await this.loadConfig()
    const updated = { ...current, ...fieldConfig }
    this.cachedConfig = updated
    await this.plugin.saveData(CONFIG_FILE, updated)
  }

  clear() {
    this.cachedConfig = null
  }
}

// 单例 store
const store = new ConfigStore()

/**
 * useConfigStore 函数形式调用
 */
export function useConfigStore() {
  return store
}
