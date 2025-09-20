// 兰空图床选项
export interface LskyOptions {
  baseUrl: string       // 必填，图床基础 URL
  email: string         // 必填，图床用户名
  password: string      // 必填，图床密码
  strategyId?: number   // 可选，存储策略 id，默认 1
  token?: string        // 可选，已有 token，可直接复用
}

// 其他图床选项
export interface EasyImgrOptions {
  baseUrl: string       // 图床基础 URL
  token: string         // API token
}

// 上传结果统一接口
export interface UploadResult {
  success: boolean
  url?: string          // 成功时返回可插入笔记本的 markdown 地址
  error?: string        // 失败时返回错误信息
}
