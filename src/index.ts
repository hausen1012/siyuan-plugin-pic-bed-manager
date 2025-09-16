import {
  Plugin,
  showMessage,
  Dialog
} from "siyuan";
import "@/index.scss";
import { LskyUploader } from "@/utils/lsky"
import Client from "@/utils/sdk"
import { getCaretNodeId } from "./utils"
import { IResponse } from "@siyuan-community/siyuan-sdk/dist/src/types/kernel/kernel";
import App from "@/App.vue";
import { createApp } from "vue";
import "./assets/index.css"
import { Config } from "@/interface"

export default class ImgUploadPlugin extends Plugin {

  private configFile = "config.json"

  private config = {
    notebookId: "",
    baseUrl: "",
    email: "",
    password: "",
    strategyId: 1,
  }

  async onload() {
    const data = await this.loadData(this.configFile)
    this.config = data ?? this.config
  }

  openSetting() {
    // 创建 Vue 应用并挂载到 Dialog 内部
    const app = createApp(App);
    // 假设你有一个自定义 Dialog 类
    let dialog = new Dialog({
      title: "图床设置",
      content: `<div id="SettingPanel" style="height: 100%;"></div>`,
      width: "800px",
      destroyCallback: (options) => {
        console.log("destroyCallback", options);
        // 销毁 Vue 实例
        app.unmount();
      }
    });
    
    app.provide('plugin', this);
    app.provide('configFile', this.configFile)
    app.mount(dialog.element.querySelector("#SettingPanel")!);
  }

  onLayoutReady() {
    // onEvent
    this.onEvent()
  }

  onunload() {
    // offEvent
    this.offEvent()
  }

  private async onEvent() {
    this.eventBus.on("paste", this.picturePasteEventListener)
    console.log("注册粘贴事件完成")
  }

  private offEvent() {
    this.eventBus.off("paste", () => {})
    console.log("销毁粘贴事件完成")
  }

  protected readonly picturePasteEventListener = async (e: CustomEvent) => {    
    const detail = e.detail
    console.log("paste detail =>", detail)
    const files = detail.files

    console.log(this.config)

    // 获取笔记本 id
    const notebookId = detail?.protyle?.notebookId
    console.log("notebookId: " +  notebookId)
    if (!notebookId) {
      console.log("无法获取笔记本 ID")
      return
    }
    if(notebookId != this.config.notebookId){
      console.log("当前笔记本无图床策略")
      return
    }

    // 校验文件
    if (!files || files.length == 0) {
      console.log("粘贴板无图片，跳过")
      return
    }

    // 阻止思源默认上传
    e.preventDefault()
    e.stopPropagation()
    if (files.length > 1) {
      console.log('仅支持一次性上传单张图片')
      return
    }
    const file = files[0]

    // 获取鼠标所在块id
    const nodeId = getCaretNodeId()

    try {
      showMessage("正在上传图片，请勿进行刷新!")

      const uploader = new LskyUploader({
        baseUrl: this.config.baseUrl,
        email: this.config.email,
        password: this.config.password
      })

      let uploadResult = null
      try {
        uploadResult = await uploader.upload(file)
        console.log("图片上传成功：", uploadResult.url)
        showMessage('图片上传成功')
      }catch (err) {
        console.error("上传图片失败", err)
        throw err;
      }
    
      try{
        await this.afterUpload(nodeId, uploadResult.url)
        showMessage('图片链接插入成功')
      }catch (err) {
        console.error("上传成功，但写入块失败", err)
        throw err;
      }
      


    } catch (e) {
      console.log(e.toString())
    }
  }

  private readonly afterUpload = async (nodeId: string, url: string): Promise<IResponse>  => {

    console.log(nodeId + " " + url )
    // 插入以后需要做的事
    try {
      return await Client.insertBlock({ data: url, dataType: "markdown", parentID: nodeId })
    } catch (err) {
      console.error("上传失败", err)
      throw err
    }
  }
}
