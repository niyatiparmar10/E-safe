import { ArrowRight, ExternalLink, MapPinned, ShieldAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Navigate, useNavigate } from 'react-router'
import Button from '../components/Button'
import ListenButton from '../components/ListenButton'
import RiskBadge from '../components/RiskBadge'
import ScanProgress from '../components/ScanProgress'
import { useMessages } from '../hooks/useMessages'
import { useScanFlow } from '../hooks/useScanFlow'

function ScanResultPage() {
  const { currentScan, clearScan } = useScanFlow()
  const { scan } = useMessages()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  if (!currentScan?.photoUrl) return <Navigate to="/dashboard/scan" replace />
  if (!currentScan.result) return <Navigate to="/scan/context" replace />

  const { result } = currentScan
  const state = scan.resultStates[result.riskLevel] || scan.resultStates.UNCERTAIN
  const needsRecycler = result.riskLevel === 'AMBER' || result.riskLevel === 'RED' || result.recyclerRecommended
  const audioText = `${state.title}. ${scan.resultDetectedItem}: ${result.detectedItem}. ${result.guidanceText} ${state.uncertainty}`

  function startNewScan() {
    clearScan()
    navigate('/dashboard/scan')
  }

  return (
    <div className="scan-result page-stack">
      <div className="result-intro"><p className="eyebrow">{scan.resultEyebrow}</p><h1>{state.title}</h1></div>
      <ScanProgress steps={scan.progress} activeStep={2} />

      <motion.section
        className={`risk-result risk-result--${result.riskLevel.toLowerCase()}`}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="risk-result__photo"><img src={currentScan.photoUrl} alt={`Photo used for the ${result.detectedItem} assessment`} /></div>
        <div className="risk-result__summary">
          <RiskBadge level={result.riskLevel.toLowerCase()} />
          <h2>{result.detectedItem}</h2>
          <dl className="confidence-list">
            <div><dt>{scan.resultItemConfidence}</dt><dd>{Math.round(result.itemConfidence * 100)}%</dd></div>
            <div><dt>{scan.resultConfidence}</dt><dd>{Math.round(result.riskConfidence * 100)}%</dd></div>
          </dl>
          <p>{state.uncertainty}</p>
          <ListenButton text={audioText} />
        </div>
      </motion.section>

      <section className="result-panel result-panel--guidance">
        <span className="result-panel__icon"><ShieldAlert size={23} /></span>
        <div><p className="eyebrow">{scan.resultGuidance}</p><h2>{result.guidanceText}</h2></div>
      </section>

      <div className="result-detail-grid">
        <section className="result-panel">
          <p className="eyebrow">{scan.resultHazards}</p>
          {result.visibleHazards.length ? (
            <ul className="hazard-list">
              {result.visibleHazards.map((hazard) => <li key={hazard}><strong>{hazard}</strong><span>{Math.round((result.hazardConfidences[hazard] || 0) * 100)}% {scan.resultHazardConfidence}</span></li>)}
            </ul>
          ) : <p className="result-panel__body">{scan.resultNoHazards}</p>}
        </section>
        <section className="result-panel">
          <p className="eyebrow">{scan.resultReason}</p>
          <p className="result-panel__body">{result.reasonText}</p>
        </section>
      </div>

      <section className="result-panel result-sources">
        <p className="eyebrow">{scan.resultReferences}</p>
        <ul>{result.guidanceSources.map((source) => <li key={source}><ExternalLink size={16} /> {source}</li>)}</ul>
        <p>{scan.resultReferencesPlaceholder}</p>
      </section>

      <p className={`history-consent history-consent--${currentScan.saveToHistory ? 'saved' : 'private'}`}>{currentScan.saveToHistory ? scan.resultHistorySaved : scan.resultHistoryNotSaved}</p>

      <div className="result-actions">
        {needsRecycler && <Button type="button" className="result-actions__recycler" onClick={() => navigate(`/recyclers?item=${encodeURIComponent(result.detectedItem)}`)}><MapPinned size={19} /> {scan.resultFindRecycler} <ArrowRight size={17} /></Button>}
        <Button type="button" variant={needsRecycler ? 'secondary' : 'primary'} onClick={startNewScan}>{scan.resultNewScan} <ArrowRight size={17} /></Button>
      </div>
    </div>
  )
}

export default ScanResultPage
