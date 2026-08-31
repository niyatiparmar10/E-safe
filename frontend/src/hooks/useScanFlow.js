import { useContext } from 'react'
import { ScanFlowContext } from '../contexts/scanFlowContext'

export function useScanFlow() {
  const context = useContext(ScanFlowContext)
  if (!context) throw new Error('useScanFlow must be used within a ScanFlowProvider.')
  return context
}
