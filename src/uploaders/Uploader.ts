// src/utils/uploader.ts
import { loadConfig, saveConfigField } from "@/utils/configManager"
import type { ImgBedConfig } from "@/interface/config"
import type { UploadResult } from "@/interface/uploader"
import LskyUploader from "@/uploaders/LskyUploader"
import OtherUploader from "@/uploaders/OtherUploader"

export async function upload(bedConfig: ImgBedConfig, file: File): Promise<string> {
  let uploader: LskyUploader | OtherUploader;

  if (bedConfig.type === "lsky") {
    uploader = new LskyUploader({
      baseUrl: bedConfig.baseUrl,
      email: bedConfig.email,
      password: bedConfig.password,
      strategyId: bedConfig.strategyId,
      token: bedConfig.token
    });

    if (!bedConfig.token) {
      bedConfig.token =  await uploader.fetchToken()  
      uploader.setToken(bedConfig.token)
      // 保存token，以免每次上传都需要重新获取
      const appConfig = await loadConfig()
      const imgBeds = appConfig.imgBedList.map(bed =>
        bed.id === bedConfig.id ? { ...bed, token: bedConfig.token } : bed
      );
      await saveConfigField({ imgBedList: imgBeds });
    }
  } else if (bedConfig.type === "other1") {
    uploader = new OtherUploader({
      baseUrl: bedConfig.baseUrl,
      token: bedConfig.token
    });
  } else {
    throw new Error(`不支持的图床类型 : ${(bedConfig as ImgBedConfig).type}`);
  }

  try {
    const result: UploadResult = await uploader.upload(file);
    return result.url;
  } catch (err: any) {
    console.error(err);
    throw new Error("上传失败");
  }
}
