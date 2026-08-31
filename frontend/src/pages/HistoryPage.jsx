import { AlertCircle, History as HistoryIcon, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import HistoryDetailsDialog from '../components/HistoryDetailsDialog'
import PageIntro from '../components/PageIntro'
import RiskBadge from '../components/RiskBadge'
import { useMessages } from '../hooks/useMessages'
import { deleteScan, getScanHistory } from '../services/scanService'

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function HistorySkeleton() {
  return <div className="history-skeleton" aria-label="Loading history"><span /><span /><span /></div>
}

function HistoryPage() {
  const { history } = useMessages()
  const [scans, setScans] = useState(null)
  const [error, setError] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [selectedScan, setSelectedScan] = useState(null)
  const [scanToDelete, setScanToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadScans = useCallback(async () => {
    try {
      const savedScans = await getScanHistory()
      setScans(savedScans)
      setError('')
    } catch {
      setError(history.errorDescription)
    }
  }, [history.errorDescription])

  useEffect(() => { void Promise.resolve().then(loadScans) }, [loadScans])

  const visibleScans = useMemo(() => (scans || []).filter((scan) => riskFilter === 'ALL' || scan.riskLevel === riskFilter), [riskFilter, scans])

  async function confirmDelete() {
    if (!scanToDelete) return
    setIsDeleting(true)
    try {
      await deleteScan(scanToDelete.scanId)
      setScans((currentScans) => currentScans?.filter((scan) => scan.scanId !== scanToDelete.scanId) || [])
      if (selectedScan?.scanId === scanToDelete.scanId) setSelectedScan(null)
      setScanToDelete(null)
    } catch {
      setError(history.errorDescription)
      setScanToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="history-page page-stack">
      <PageIntro eyebrow={history.eyebrow} title={history.title} description={history.description} />
      <label className="history-filter"><span>{history.filterLabel}</span><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}><option value="ALL">{history.filters[0]}</option><option value="GREEN">{history.filters[1]}</option><option value="AMBER">{history.filters[2]}</option><option value="RED">{history.filters[3]}</option><option value="UNCERTAIN">{history.filters[4]}</option></select></label>
      {error && <EmptyState icon={AlertCircle} title={history.errorTitle} description={error}><button className="button button--secondary" type="button" onClick={loadScans}>{history.retry}</button></EmptyState>}
      {!error && scans === null && <><HistorySkeleton /><p className="history-loading-copy">{history.loadingDescription}</p></>}
      {!error && scans && visibleScans.length === 0 && <EmptyState icon={HistoryIcon} title={history.emptyTitle} description={history.emptyDescription} />}
      {!error && visibleScans.length > 0 && <div className="history-list">
        {visibleScans.map((scan) => (
          <article className="history-card" key={scan.scanId}>
            <button className="history-card__open" type="button" onClick={() => setSelectedScan(scan)} aria-label={`${history.open}: ${scan.detectedItem}`}>
              <img src={scan.photoUrl} alt="" />
              <span className="history-card__content"><span className="history-card__heading"><span><strong>{scan.detectedItem}</strong><small>{formatDateTime(scan.timestamp)}</small></span><RiskBadge level={scan.riskLevel} /></span><span className="history-card__hazards">{scan.visibleHazards.length ? scan.visibleHazards.join(' · ') : history.noHazards}</span><span className="history-card__confidence">{Math.round(scan.riskConfidence * 100)}% {history.confidence.toLowerCase()}</span></span>
            </button>
            <button className="history-card__delete" type="button" aria-label={`${history.delete}: ${scan.detectedItem}`} onClick={() => setScanToDelete(scan)}><Trash2 size={18} /></button>
          </article>
        ))}
      </div>}
      {selectedScan && <HistoryDetailsDialog scan={selectedScan} onClose={() => setSelectedScan(null)} />}
      {scanToDelete && <ConfirmDialog title={history.deleteTitle} description={history.deleteDescription} cancelLabel={history.cancel} confirmLabel={isDeleting ? history.deleting : history.delete} isBusy={isDeleting} onCancel={() => setScanToDelete(null)} onConfirm={confirmDelete} />}
    </div>
  )
}

export default HistoryPage
