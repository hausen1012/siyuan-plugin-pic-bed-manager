import { Plugin, showMessage, Dialog } from "siyuan"
import { createApp } from "vue"
import App from "./App.vue"
import { getCaretNodeId } from "./utils"
import "@/assets/tailwind.css"
import "@/index.scss"
import { registerPlugin, loadConfig } from "@/utils/configManager"
import { upload } from "@/uploaders/Uploader"
import { resolveFiles } from "@/utils/file"
 
export default class ImgUploadPlugin extends Plugin {

  async onload() {
    registerPlugin(this)
    await loadConfig()
    //showMessage("图床配置加载成功", 3000, "info")
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
    
    const files = resolveFiles(e.detail.files)
    if (!files || files.length == 0) {
      console.log("粘贴板无图片，跳过")
      e.detail.resolve({
        textPlain: e.detail.textPlain,
      })
      return
    }
    const notebookId = e.detail?.protyle?.notebookId
    if (!notebookId){
      showMessage("笔记本不存在", 3000, "error")
      return
    }

    // 获取配置
    const appConfig = await loadConfig()
    const imgBedList = appConfig.imgBedList
    const bedConfig = imgBedList.find(bed => bed.notebookIds.includes(notebookId))
    const file = files[0]
    const nodeId = getCaretNodeId()
    if (!bedConfig) {
      showMessage("当前笔记本无图床策略")
      e.detail.resolve({
        files
      })
      return
    }

    // 开始上传到图床
    if (files.length > 1) {
      showMessage("仅支持上传单张图片")
      return
    }
    showMessage("正在上传图片，请勿刷新", 2000, "info")
  
    try {
      // 判断是否压缩

      // 上传
      showMessage("正在上传图片", 30000, "info", nodeId)
      const url = await upload(bedConfig, file)
      if(url === undefined) {
        showMessage("上传失败", 3000, "error", nodeId)
        return
      }
      console.log("url: ", url)

      // 上传后
      await this.afterUpload(e, url)
      showMessage("上传成功", 3000, "info", nodeId)
    } catch (err) {
      console.error(err)
      showMessage("上传失败", 5000, "error", nodeId)
    }
    return
  }

  private readonly afterUpload = async (e: CustomEvent, url: string) => {
    e.detail.resolve({
      textPlain: url,
      files: []
    })
  }
}
