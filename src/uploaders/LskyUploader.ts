import { LskyOptions, UploadResult } from "@/interface/config"

export default class LskyUploader {
  private baseUrl: string
  private email: string
  private password: string
  private token: string = ""
  private strategyId: number

  // 默认属性
  private readonly tokenPath: string = "/api/v1/tokens"
  private readonly uploadPath: string = "/api/v1/upload"

  constructor(options: LskyOptions) {
    if (!options.baseUrl || !options.email || !options.password) {
      throw new Error("图床地址、邮箱或密码不完整")
    }
    if (!/^https?:\/\//.test(options.baseUrl)) {
      throw new Error("图床地址应使用完整 URL（http[s]://）");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.email = options.email
    this.password = options.password
    this.strategyId = options.strategyId ?? 1
    this.token = options.token
  }

  /**
   * 获取 token，如果已有则直接返回
   */
  public async fetchToken(): Promise<string> {
    if (this.token) return this.token  // 已缓存
    console.log("lsky", this)
    try {
      const url = `${this.baseUrl}${this.tokenPath}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
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
      const formData = new FormData()
      formData.append("file", file)
      formData.append("strategy_id", this.strategyId.toString())

      const res = await fetch(`${this.baseUrl}${this.uploadPath}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (data.status === true && data.data?.links) {
        return { success: true, url: data.data.links.markdown }
      } else {
        return { success: false, error: data.msg || "上传失败" }
      }
    } catch (err: any) {
      return { success: false, error: err.message || "网络错误" }
    }
  }

  public getToken(): string {
    return this.token
  }

  public setToken(token: string) {
    this.token = token;
  }
}
