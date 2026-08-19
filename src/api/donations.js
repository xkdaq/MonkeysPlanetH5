const baseUrl = import.meta.env.BASE_URL

// 当前读取静态 JSON 文件（public/data/donations.json）；
// 后续赞赏记录增多后，改为后端接口（如 /h5/donations/list）即可，组件无需改动
export async function fetchDonations() {
  const response = await fetch(`${baseUrl}data/donations.json`)
  if (!response.ok) {
    throw new Error(`获取赞赏名单失败：${response.status}`)
  }
  const list = await response.json()
  return Array.isArray(list) ? list : []
}
