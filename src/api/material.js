import { request } from './request'

export function getMaterialList(params) {
  return request('/h5/material/list', params)
}

export function getMaterialDetail(id) {
  return request('/h5/material/details', { id })
}

export function getMaterialSubjects() {
  return request('/h5/material/subjects')
}

export function getMaterialCategories(subjectId) {
  return request('/h5/material/categories', { subjectId })
}
