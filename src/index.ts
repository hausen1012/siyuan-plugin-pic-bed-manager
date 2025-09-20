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

  private configStore = useConfigStore()

  async onload() {
    // 插件启动时加载数据
    this.configStore.init(this)
    await this.configStore.loadConfig()
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
    // 注册顶部图标
    this.addIcons(`
      <symbol id="iconPic" viewBox="0 0 1024 1024">
      <path d="M935.563636 97.745455H88.436364C39.563636 97.745455 0 137.309091 0 188.509091V837.818182c0 48.872727 39.563636 88.436364 88.436364 88.436363h844.8c48.872727 0 88.436364-39.563636 88.436363-88.436363V188.509091c2.327273-51.2-37.236364-90.763636-86.109091-90.763636zM88.436364 174.545455h844.8c6.981818 0 11.636364 4.654545 11.636363 11.636363v456.145455L721.454545 381.672727 477.090909 693.527273s-188.509091-153.6-195.490909-153.6c-6.981818 0-139.636364 186.181818-204.8 276.945454v-628.363636c0-6.981818 4.654545-13.963636 11.636364-13.963636z" p-id="10003"></path><path d="M249.018182 342.109091m-62.836364 0a62.836364 62.836364 0 1 0 125.672727 0 62.836364 62.836364 0 1 0-125.672727 0Z" p-id="10004"></path>
      </symbol>
    `);
    this.addTopBar({
        icon: 'iconPic',
        title: '图床管家',
        callback: () => {
          this.openSetting()
        },
    });
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

    //console.log("detail: ", e.detail)
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

    const appConfig = await this.configStore.loadConfig()
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
