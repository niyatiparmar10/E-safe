import { appConfig } from '../config/env'
import { languageOptions } from '../config/messages'
import { mockResponse } from './mockUtils'
import { apiRequest } from './apiClient'

export async function getSupportedLanguages() {
  if (appConfig.useMockApi) return mockResponse(languageOptions, 120)
  const response = await apiRequest('/languages/messages')
  return response.languages || languageOptions
}
