const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  useMockApi,
  // DEVELOPMENT ONLY — remove this once the analysis endpoint is connected.
  enableMockResultSwitcher: import.meta.env.DEV,
}
