import { Plugin, showMessage, Dialog } from "siyuan"
import { createApp } from "vue"
import App from "./App.vue"
import { getCaretNodeId } from "./utils/domUtils"
import "@/index.scss"
import { upload } from "@/uploaders/Uploader"
import { resolveFiles,isImageFile } from "@/utils/file"
import { compressImage } from "@/utils/tinypng"
import { useConfigStore } from "@/store/configStore"
 
export default class ImgUploadPlugin extends Plugin {

  async onload() {
    // 插件启动时加载数据
    const configStore = useConfigStore()
    configStore.init(this)
    await configStore.loadConfig()
  }

  openSetting() {
    const app = createApp(App)
    const dialog = new Dialog({
      title: "图床设置",
      content: `<div id="SettingPanel" style="height:100%;"></div>`,
      width: "800px",
      destroyCallback: () => app.unmount()
    })

    app.mount(dialog.element.querySelector("#SettingPanel")!)
  }

  onLayoutReady() {
    this.onEvent()
  }

  onunload() {
    this.offEvent()
  }

  private async onEvent() {
    this.eventBus.on("paste", this.picturePasteEventListener)
    console.log("注册粘贴事件")
  }

  private offEvent() {
    this.eventBus.off("paste", () => {})
    console.log("销毁粘贴事件")
  }

  private readonly picturePasteEventListener = async (e: CustomEvent) => {

    console.log("detail: ", e.detail)
    // 阻止默认事件
    e.preventDefault()
    try {
      await this.upload(e)
    }catch(err){
      showMessage(err.message, 5000, "error")
    }
  }

  private readonly upload = async (e: CustomEvent) => {

    const files = resolveFiles(e.detail.files)
    // 粘贴板无图片或包含非图片文件，后续操作交还给思源
    if (!files || files.length === 0 || files.some(file => !isImageFile(file.name))) {
      e.detail.resolve({
        textPlain: e.detail.textPlain,
        files,
      })
      return
    }

    const notebookId = e.detail?.protyle?.notebookId
    if (!notebookId){
      throw new Error("笔记本不存在")
    }

    const appConfig = await loadConfig()
    const imgBedList = appConfig.imgBedList
    const bedConfig =
      imgBedList.find(bed => bed.notebookIds?.includes(notebookId)) ||
      imgBedList.find(bed => bed.defaultImgBed);
    // 笔记本没有配置默认图床，也没有绑定默认图床，不进行上传
    if (!bedConfig) {
      showMessage("当前笔记本无图床策略", 3000, "info")
      e.detail.resolve({
        textPlain: e.detail.textPlain,
        files,
      })
      return
    }

    const nodeId = getCaretNodeId()
    showMessage("正在上传图片，请勿刷新", 3000, "info", nodeId)
  
    const total = files.length
    let successCount = 0
    const urls: string[] = []
    for (let i = 0; i < total; i++) {
      let file = files[i]
    
      try {
        // 压缩
        const compressConfig = appConfig.compressConfig
        if (bedConfig.enableCompress || compressConfig?.enable) {
          showMessage(`(${i + 1}/${total}) 图片正在压缩 ${file.name}`, 30000, "info", nodeId)
          file = await compressImage(file, compressConfig?.apiUrl, compressConfig?.apiKey)
        }
      }catch (err) {
        showMessage(`(${i + 1}/${total}) 图片压缩异常: ${file.name}, ${err.message}`, 5000, "error", nodeId)
        return
      }

      try{
        // 上传
        showMessage(`(${i + 1}/${total}) 正在上传 ${file.name}`, 30000, "info", nodeId)
        const url = await upload(bedConfig, file)
    
        urls.push(url)
        successCount++
        showMessage(`(${i + 1}/${total}) 图片上传成功: ${file.name}`, 3000, "info", nodeId)
      } catch (err) {
        throw new Error(`(${i + 1}/${total}) 图片上传异常: ${file.name}, ${err.message}`)
        return
      }
    }
    
    // 统一处理
    if (urls.length > 0) {
      await this.afterUpload(e, urls)
      showMessage(`图片上传成功 (${successCount}/${total}) 张`, 3000, "info", nodeId)
    }
  }

  private readonly afterUpload = async (e: CustomEvent, urls: string[]) => {
    // 拼接成 Markdown，每个 url 换行
    const markdown = urls.map(url => `![](${url})`).join("  \n")
  
    e.detail.resolve({
      textPlain: markdown,
      files: []
    })
  }
  
}
