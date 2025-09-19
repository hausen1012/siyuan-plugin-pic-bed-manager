import Client from "@/utils/sySdk"
import { api } from "@siyuan-community/siyuan-sdk/dist/src/types/kernel"


/**
 * 压缩图片（通过 forwardProxy 调用 TinyPNG API）
 * @param file 要压缩的 File 对象
 * @param apiKey 你的 TinyPNG API Key
 * @returns 压缩后的 File 实例
 */
export async function compressImage(file: File, apiUrl: string, apiKey: string): Promise<File> {

  // 配置校验
  if (!apiUrl || !apiKey) {
    throw new Error("请完善压缩配置")
  }

  // 先读成 ArrayBuffer
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer

        // =========================
        // Step 1: 上传到 TinyPNG
        // =========================
        const shrinkResp = await Client.forwardProxy({
          url: apiUrl,
          method: "POST",
          headers: [
            { Authorization: "Basic " + btoa("api:" + apiKey) },
            { "Content-Type": "application/octet-stream" },
          ],
          // 因为 payload 只能是 string 或 object
          // 这里我们把 ArrayBuffer 转成 base64
          payload: arrayBufferToBase64(arrayBuffer),
          payloadEncoding: "base64", // 请求体按 base64 编码
          responseEncoding: "text",  // 返回 JSON 文本
          timeout: 30000,
        })

        const shrinkResult = JSON.parse(shrinkResp.data.body as string)
        console.log(shrinkResult)
        if (!shrinkResult?.output?.url) {
          reject(new Error("TinyPNG 压缩失败"))
          return
        }

        // =========================
        // Step 2: 下载压缩后的图片
        // =========================
        const downloadResp = await Client.forwardProxy({
          url: shrinkResult.output.url,
          method: "GET",
          headers: [],
          responseEncoding: "base64", // 图片返回 base64
          timeout: 30000,
        })

        // base64 转回二进制
        const u8arr = base64ToUint8Array(downloadResp.data.body as string)
        const blob = new Blob([u8arr], { type: file.type })
        const compressedFile = new File([blob], file.name, { type: file.type })

        resolve(compressedFile)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// =============== 工具函数 ===============
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const len = binary.length
  const u8arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    u8arr[i] = binary.charCodeAt(i)
  }
  return u8arr
}
