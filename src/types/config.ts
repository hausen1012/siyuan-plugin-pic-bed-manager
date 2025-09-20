import { ImgBedType } from "@/constants/imgBedType"

export interface BaseImgBedConfig {
  id: string
  name: string
  type: ImgBedType
  notebookIds: string[]
  enableCompress: boolean
  defaultImgBed: boolean
}

export interface LskyConfig extends BaseImgBedConfig {
  type: ImgBedType.Lsky
  baseUrl: string
  email: string
  password: string
  strategyId?: number
  token?: string
}

export interface OtherConfig extends BaseImgBedConfig {
  type: ImgBedType.EasyImg
  baseUrl: string
  token: string
}

export type ImgBedConfig = LskyConfig | OtherConfig

export interface CompressConfig {
  apiUrl: string,
  apiKey: string,
  enable: boolean
}

export interface AppConfig {
  imgBedList: ImgBedConfig[]
  compressConfig: CompressConfig
}
