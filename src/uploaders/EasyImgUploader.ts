import { EasyImgrOptions, UploadResult } from "@/interface/uploader"

export default class EasyImgUploader {
  private baseUrl: string
  private token: string
  private readonly uploadPath: string = "/api/index.php"

  constructor(options: EasyImgrOptions) {
    if (!options.baseUrl || !options.token) {
      throw new Error("baseUrl and token are required")
    }
    this.baseUrl = options.baseUrl
    this.token = options.token
  }

  /**
   * 上传单张图片，返回 Markdown 格式链接
   */
  public async upload(file: File | Blob): Promise<UploadResult> {
    try {
      const formData = new FormData()
      formData.append("token", this.token)
      formData.append("image", file)

      const res = await fetch(`${this.baseUrl}${this.uploadPath}`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (data.code === 200 && data.result === "success" && data.url) {
        // 直接返回 Markdown 格式
        return { success: true, url: data.url }
      } else {
        return { success: false, error: data.message || "上传失败" }
      }
    } catch (err: any) {
      return { success: false, error: err.message || "网络错误" }
    }
  }
}
