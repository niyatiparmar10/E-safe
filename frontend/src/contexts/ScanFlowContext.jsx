import { useMemo, useState } from 'react'
import { ScanFlowContext } from './scanFlowContext'

export function ScanFlowProvider({ children }) {
  const [currentScan, setCurrentScan] = useState(null)

  function startScan(photoFile, { previewUrl, saveToHistory = false } = {}) {
    const scan = {
      id: `scan-draft-${Date.now()}`,
      photoFile,
      photoUrl: previewUrl || URL.createObjectURL(photoFile),
      saveToHistory,
      status: 'context',
    }
    setCurrentScan((previousScan) => {
      if (previousScan?.photoUrl && previousScan.photoUrl !== scan.photoUrl) URL.revokeObjectURL(previousScan.photoUrl)
      return scan
    })
    return scan
  }

  function clearScan() {
    setCurrentScan((previousScan) => {
      if (previousScan?.photoUrl) URL.revokeObjectURL(previousScan.photoUrl)
      return null
    })
  }

  function updateScanContext(answers) {
    setCurrentScan((previousScan) => (previousScan ? { ...previousScan, answers, status: 'questions' } : previousScan))
  }

  function completeScan(result) {
    setCurrentScan((previousScan) => (previousScan ? { ...previousScan, result, status: 'result' } : previousScan))
  }

  const value = useMemo(
    () => ({ currentScan, startScan, clearScan, updateScanContext, completeScan }),
    [currentScan],
  )

  return <ScanFlowContext.Provider value={value}>{children}</ScanFlowContext.Provider>
}
