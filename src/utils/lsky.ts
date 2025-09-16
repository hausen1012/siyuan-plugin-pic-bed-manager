// lanxiaoUploader.ts
/**
 * 兰空图床上传器
 * Author: Hanlu
 * Date: 2025-09-14
 */

export interface LskyOptions {
  baseUrl: string       // 必填，图床基础 URL，例如 https://lsky.example.com
  email: string      // 必填，图床用户名
  password: string      // 必填，图床密码
  tokenPath?: string    // 可选，获取 token 的路径，默认 /api/v1/tokens
  uploadPath?: string   // 可选，上传接口路径，默认 /api/v1/upload
  strategyId?: number   // 可选，存储策略 id，默认 1
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export class LskyUploader {

  private baseUrl: string
  private tokenPath: string
  private uploadPath: string
  private email: string
  private password: string
  private token: string = ""
  private strategyId: number

  constructor(options: LskyOptions) {
    if (!options.baseUrl || !options.email || !options.password) {
      throw new Error("baseUrl, email, password are required")
    }
    this.baseUrl = options.baseUrl
    this.email = options.email
    this.password = options.password
    this.tokenPath = options.tokenPath ?? "/api/v1/tokens"
    this.uploadPath = options.uploadPath ?? "/api/v1/upload"
    this.strategyId = options.strategyId ?? 1
    this.token = "103|AJK53nTFLrBfwZ2M05Hma41BagvimWhDYNyovfZW"
  }

  private async fetchToken(): Promise<string> {
    if (this.token) return this.token
    try {
      const url = `${this.baseUrl}${this.tokenPath}`  
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      })
  
      const data = await res.json()
      if (data.status === true && data.data?.token) {
        this.token = data.data.token
        return this.token
      } else {
        throw new Error(data.msg || "获取 token 失败")
      }
    } catch (err: any) {
      throw new Error(err.message || "网络错误")
    }
  }

  /**
   * 上传单张图片
   */
  public async upload(file: File | Blob): Promise<UploadResult> {
    try {
      const token = await this.fetchToken()
      console.log("获取到 token:", token)
  
      const formData = new FormData()
      formData.append("file", file)
      formData.append("strategy_id", this.strategyId.toString())
  
      for (const pair of formData.entries()) {
        console.log("   ", pair[0], pair[1])
      }
  
      const res = await fetch(`${this.baseUrl}${this.uploadPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // 注意：不能设置 Content-Type 为 multipart/form-data，浏览器会自动加 boundary
        },
        body: formData,
      })
  
      const data = await res.json()
      console.log("响应 JSON:", data)
      if (data.status === true && data.data?.links) {
        console.log("✅ 上传成功:", data.data.links.url)
        return { success: true, url: data.data.links.markdown }
      } else {
        console.error("❌ 上传失败:", data.msg || "上传失败")
        return { success: false, error: data.msg || "上传失败" }
      }
    } catch (err: any) {
      console.error("❌ 上传异常:", err)
      return { success: false, error: err.message || "网络错误" }
    }
  }  
}
