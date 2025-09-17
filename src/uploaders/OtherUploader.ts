
import { OtherOptions, UploadResult } from "@/interface/imgBed"

export default class OtherUploader {
  private baseUrl: string
  private token: string
  private uploadPath: string

  constructor(options: OtherOptions) {
    if (!options.baseUrl || !options.token) {
      throw new Error("baseUrl and token are required")
    }
    this.baseUrl = options.baseUrl
    this.token = options.token
    this.uploadPath = options.uploadPath ?? "/api/v1/upload"
  }

  /**
   * 上传单张图片
   */
  public async upload(file: File | Blob): Promise<UploadResult> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${this.baseUrl}${this.uploadPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`
        },
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
}
