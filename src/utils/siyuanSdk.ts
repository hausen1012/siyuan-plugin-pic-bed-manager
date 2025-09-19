import { Client } from "@siyuan-community/siyuan-sdk";

const client: Client = new Client({ timeout: 30000, retry: 3 }, "fetch")

export default client
