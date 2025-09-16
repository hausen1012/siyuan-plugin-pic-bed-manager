import { LskyOptions } from "@/utils/lsky"

export interface Config extends LskyOptions {
  notebookId: string
  baseUrl: string
  email: string
  password: string
  strategyId?: number,
}
