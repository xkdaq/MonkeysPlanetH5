import { request } from './request'

export function getNoteList(params) {
  return request('/h5/note/list', params)
}

export function getNoteDetail(id) {
  return request('/h5/note/details', { id })
}

export function getNoteSubjects() {
  return request('/h5/note/subjects')
}

export function getNoteCategories(subjectId) {
  return request('/h5/note/categories', { subjectId })
}
