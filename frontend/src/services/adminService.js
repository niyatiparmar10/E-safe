import { appConfig } from '../config/env'
import { mockAdminDashboard, mockAdminRecyclerRecords, mockApprovedSafetyDocuments, mockStandardMessages } from '../mocks/mockData'
import { mockResponse } from './mockUtils'
import { apiRequest } from './apiClient'

let recyclerRecords = [...mockAdminRecyclerRecords]
let safetyDocuments = [...mockApprovedSafetyDocuments]
let standardMessages = [...mockStandardMessages]

export async function getAdminDashboardData() {
  if (appConfig.useMockApi) return mockResponse(mockAdminDashboard)
  return apiRequest('/admin/dashboard')
}

export async function getAdminRecyclerRecords() {
  if (appConfig.useMockApi) return mockResponse([...recyclerRecords])
  const response = await apiRequest('/admin/recyclers')
  return response.records || response
}

export async function saveAdminRecyclerRecord(record) {
  if (!appConfig.useMockApi) return apiRequest(record.id ? `/admin/recyclers/${record.id}` : '/admin/recyclers', { method: record.id ? 'PATCH' : 'POST', body: record })
  const nextRecord = { ...record, id: record.id || `admin-recycler-${Date.now()}` }
  const existingIndex = recyclerRecords.findIndex((item) => item.id === nextRecord.id)
  if (existingIndex >= 0) recyclerRecords[existingIndex] = nextRecord
  else recyclerRecords = [nextRecord, ...recyclerRecords]
  return mockResponse(nextRecord, 180)
}

export async function deleteAdminRecyclerRecord(id) {
  if (!appConfig.useMockApi) return apiRequest(`/admin/recyclers/${id}`, { method: 'DELETE' })
  recyclerRecords = recyclerRecords.filter((record) => record.id !== id)
  return mockResponse({ deleted: true, id }, 180)
}

export async function getApprovedSafetyDocuments() {
  if (appConfig.useMockApi) return mockResponse([...safetyDocuments])
  const response = await apiRequest('/admin/safety-documents')
  return response.documents || response
}

export async function saveApprovedSafetyDocument(document) {
  if (!appConfig.useMockApi) return apiRequest(document.id ? `/admin/safety-documents/${document.id}` : '/admin/safety-documents', { method: document.id ? 'PATCH' : 'POST', body: document })
  const nextDocument = { ...document, id: document.id || `admin-document-${Date.now()}` }
  const existingIndex = safetyDocuments.findIndex((item) => item.id === nextDocument.id)
  if (existingIndex >= 0) safetyDocuments[existingIndex] = nextDocument
  else safetyDocuments = [nextDocument, ...safetyDocuments]
  return mockResponse(nextDocument, 180)
}

export async function getStandardMessages() {
  if (appConfig.useMockApi) return mockResponse([...standardMessages])
  const response = await apiRequest('/admin/messages')
  return response.messages || response
}

export async function saveStandardMessage(message) {
  if (!appConfig.useMockApi) return apiRequest(message.id ? `/admin/messages/${message.id}` : '/admin/messages', { method: message.id ? 'PATCH' : 'POST', body: message })
  const nextMessage = { ...message, id: message.id || `admin-message-${Date.now()}` }
  const existingIndex = standardMessages.findIndex((item) => item.id === nextMessage.id)
  if (existingIndex >= 0) standardMessages[existingIndex] = nextMessage
  else standardMessages = [nextMessage, ...standardMessages]
  return mockResponse(nextMessage, 180)
}
