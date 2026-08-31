import { appConfig } from '../config/env'
import { mockScanHistory, mockWorkerSummary } from '../mocks/mockData'
import { mockResponse } from './mockUtils'
import { apiRequest } from './apiClient'

const savedMockResults = []
const deletedMockScanIds = new Set()

const mockScenarios = {
  GREEN: {
    detectedItem: 'Computer keyboard',
    itemConfidence: 0.89,
    visibleHazards: [],
    hazardConfidences: {},
    riskLevel: 'GREEN',
    riskConfidence: 0.74,
    reasonCodes: ['NO_OBVIOUS_SUPPORTED_VISIBLE_HAZARD'],
    reasonText: 'The supported visible checks did not identify an obvious hazard in this mock scenario.',
    guidanceText: 'No obvious supported visible hazard was identified. Continue basic collection or storage only with normal precautions.',
    guidanceSources: ['E-Safe approved handling guide — placeholder'],
    recyclerRecommended: false,
  },
  AMBER: {
    detectedItem: 'Desktop battery backup unit',
    itemConfidence: 0.81,
    visibleHazards: ['Visible casing damage'],
    hazardConfidences: { 'Visible casing damage': 0.83 },
    riskLevel: 'AMBER',
    riskConfidence: 0.78,
    reasonCodes: ['VISIBLE_CASING_DAMAGE', 'CONTEXT_REQUIRES_EXTRA_PRECAUTIONS'],
    reasonText: 'Visible casing damage or the reported context means extra precautions are needed before the item is moved or stored.',
    guidanceText: 'Isolate the item, use extra precautions and ask for trained supervision before continuing handling or storage.',
    guidanceSources: ['E-Safe approved handling guide — placeholder', 'Authorised recycler pathway — placeholder'],
    recyclerRecommended: true,
  },
  RED: {
    detectedItem: 'Swollen lithium-ion battery',
    itemConfidence: 0.86,
    visibleHazards: ['Possible battery swelling', 'Damaged outer casing'],
    hazardConfidences: { 'Possible battery swelling': 0.91, 'Damaged outer casing': 0.84 },
    riskLevel: 'RED',
    riskConfidence: 0.87,
    reasonCodes: ['POSSIBLE_BATTERY_SWELLING', 'DAMAGED_CASING'],
    reasonText: 'The mock scenario includes signs consistent with a potentially high-risk battery condition.',
    guidanceText: 'Stop manual opening or handling. Isolate the item and route it through trained personnel or an authorised facility.',
    guidanceSources: ['E-Safe approved handling guide — placeholder', 'Battery escalation pathway — placeholder'],
    recyclerRecommended: true,
  },
  UNCERTAIN: {
    detectedItem: 'Electronic item not confidently identified',
    itemConfidence: 0.42,
    visibleHazards: [],
    hazardConfidences: {},
    riskLevel: 'UNCERTAIN',
    riskConfidence: 0.36,
    reasonCodes: ['INSUFFICIENT_SUPPORTED_VISIBLE_CONTEXT'],
    reasonText: 'The supported visible checks do not provide enough confidence for a clearer result in this mock scenario.',
    guidanceText: 'Uncertain — isolate the item and ask a trained person.',
    guidanceSources: ['E-Safe uncertainty pathway — placeholder'],
    recyclerRecommended: true,
  },
}

function sortNewestFirst(scans) {
  return [...scans].sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime())
}

export async function getWorkerSummary() {
  if (appConfig.useMockApi) return mockResponse(mockWorkerSummary)
  const history = await apiRequest('/scan/history')
  const scans = history.scans || history
  return {
    scansThisWeek: scans.length,
    highRiskFindings: scans.filter((scan) => ['AMBER', 'RED', 'UNCERTAIN'].includes(scan.riskLevel)).length,
    nearbyRecyclers: null,
  }
}

export async function getScanHistory() {
  if (appConfig.useMockApi) {
    const seededScans = mockScanHistory.filter((scan) => !deletedMockScanIds.has(scan.scanId))
    return mockResponse(sortNewestFirst([...savedMockResults, ...seededScans]))
  }
  const response = await apiRequest('/scan/history')
  return response.scans || response
}

export async function submitScanContext({ scanId, answers }) {
  if (appConfig.useMockApi) return mockResponse({ scanId, accepted: true }, 220)
  return apiRequest('/scan/context', { method: 'POST', body: { scanId, answers } })
}

// DEVELOPMENT ONLY: replace this mock contract with POST /scans/analyse.
export async function analyseScan({ scanId, answers, saveToHistory = false, mockScenario = 'AMBER' }) {
  if (!appConfig.useMockApi) return apiRequest('/scan/analyse', { method: 'POST', body: { scanId, answers, saveToHistory } })

  const scenario = mockScenarios[mockScenario] || mockScenarios.UNCERTAIN
  return mockResponse({ scanId, ...scenario, answers, timestamp: new Date().toISOString() }, 900)
}

// DEVELOPMENT ONLY: in-memory mock history. It deliberately never stores the image.
export async function saveScanResultToHistory(result, photoFile) {
  if (!appConfig.useMockApi) return { saved: true, scanId: result.scanId }

  const photoUrl = photoFile ? URL.createObjectURL(photoFile) : null
  savedMockResults.unshift({
    ...result,
    photoUrl,
    contextAnswers: result.answers || {},
  })
  return mockResponse({ saved: true, scanId: result.scanId }, 180)
}

// DEVELOPMENT ONLY: this keeps mock history mutations inside the service layer.
export async function deleteScan(scanId) {
  if (!appConfig.useMockApi) return apiRequest(`/scan/${scanId}`, { method: 'DELETE' })

  const savedIndex = savedMockResults.findIndex((scan) => scan.scanId === scanId)
  if (savedIndex >= 0) {
    const [deletedScan] = savedMockResults.splice(savedIndex, 1)
    if (deletedScan.photoUrl?.startsWith('blob:')) URL.revokeObjectURL(deletedScan.photoUrl)
    return mockResponse({ deleted: true, scanId })
  }

  if (mockScanHistory.some((scan) => scan.scanId === scanId)) {
    deletedMockScanIds.add(scanId)
    return mockResponse({ deleted: true, scanId })
  }

  throw new Error('This scan could not be found in mock history.')
}

export async function createScan(photoFile) {
  if (appConfig.useMockApi) {
    return mockResponse({ id: 'scan-new', photoName: photoFile?.name || 'New item', status: 'draft' })
  }
  const formData = new FormData()
  formData.append('image', photoFile)
  return apiRequest('/scan/upload', { method: 'POST', formData })
}
