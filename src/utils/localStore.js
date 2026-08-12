const FAV_KEY = 'mp_favorites'
const HISTORY_KEY = 'mp_history'
const HISTORY_MAX = 50

function readList(key) {
  try {
    const list = JSON.parse(localStorage.getItem(key))
    return Array.isArray(list) ? list : []
  } catch (error) {
    return []
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch (error) {
    // 存储满了或被禁用时静默失败
  }
}

function sameItem(a, b) {
  return a.type === b.type && String(a.id) === String(b.id)
}

export function getFavorites() {
  return readList(FAV_KEY)
}

export function isFavorite(type, id) {
  return getFavorites().some((item) => sameItem(item, { type, id }))
}

export function toggleFavorite(item) {
  const list = getFavorites()
  const index = list.findIndex((entry) => sameItem(entry, item))
  if (index >= 0) {
    list.splice(index, 1)
    writeList(FAV_KEY, list)
    return false
  }
  list.unshift({ id: item.id, type: item.type, title: item.title, time: Date.now() })
  writeList(FAV_KEY, list)
  return true
}

export function getHistory() {
  return readList(HISTORY_KEY)
}

export function addHistory(item) {
  if (!item || item.id === undefined || item.id === null) {
    return
  }
  let list = getHistory().filter((entry) => !sameItem(entry, item))
  list.unshift({ id: item.id, type: item.type, title: item.title, time: Date.now() })
  list = list.slice(0, HISTORY_MAX)
  writeList(HISTORY_KEY, list)
}

export function clearLocalData() {
  try {
    localStorage.removeItem(FAV_KEY)
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    // ignore
  }
}
