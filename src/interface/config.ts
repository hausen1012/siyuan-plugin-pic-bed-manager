import { ImgBedType } from "@/constants/imgBedType"

export interface BaseImgBedConfig {
  id: string
  name: string
  type: ImgBedType
  notebookIds: string[]
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
  type: ImgBedType.Other
  baseUrl: string
  token: string
}

export type ImgBedConfig = LskyConfig | OtherConfig

export interface CompressConfig {
  url: string,
  key: string,
  enable: boolean
}

export interface AppConfig {
  imgBedList: ImgBedConfig[]
  compressConfig: CompressConfig
}
