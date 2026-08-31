import { ExternalLink, MapPinned, X } from 'lucide-react'
import { Link } from 'react-router'
import RiskBadge from './RiskBadge'
import { useMessages } from '../hooks/useMessages'

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function HistoryDetailsDialog({ scan, onClose }) {
  const { history, scan: scanMessages } = useMessages()
  const answers = scan.contextAnswers || scan.answers || {}

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-details-title">
        <header><div><p className="eyebrow">{history.resultTitle}</p><h2 id="history-details-title">{scan.detectedItem}</h2><p>{formatDateTime(scan.timestamp)}</p></div><button className="icon-button" type="button" aria-label={history.close} onClick={onClose}><X size={19} /></button></header>
        <div className="history-dialog__hero"><img src={scan.photoUrl} alt={`Saved photo for ${scan.detectedItem}`} /><div><RiskBadge level={scan.riskLevel} /><p>{Math.round(scan.riskConfidence * 100)}% {scanMessages.resultConfidence.toLowerCase()}</p><p>{Math.round(scan.itemConfidence * 100)}% {scanMessages.resultItemConfidence.toLowerCase()}</p></div></div>
        <section><p className="eyebrow">{history.hazards}</p>{scan.visibleHazards.length ? <ul>{scan.visibleHazards.map((hazard) => <li key={hazard}>{hazard} <span>{Math.round((scan.hazardConfidences[hazard] || 0) * 100)}%</span></li>)}</ul> : <p>{history.noHazards}</p>}</section>
        <section><p className="eyebrow">{history.reason}</p><p>{scan.reasonText}</p></section>
        <section className="history-dialog__guidance"><p className="eyebrow">{history.guidance}</p><h3>{scan.guidanceText}</h3></section>
        <section><p className="eyebrow">{history.contextAnswers}</p><dl>{scanMessages.questions.map((question) => <div key={question.id}><dt>{question.text}</dt><dd>{answers[question.id] || history.unknownAnswer}</dd></div>)}</dl></section>
        <section><p className="eyebrow">{history.sources}</p><ul className="history-dialog__sources">{scan.guidanceSources.map((source) => <li key={source}><ExternalLink size={15} /> {source}</li>)}</ul></section>
        {scan.recyclerRecommended && <Link className="button button--primary history-dialog__recycler" to={`/recyclers?item=${encodeURIComponent(scan.detectedItem)}`} onClick={onClose}><MapPinned size={18} /> {history.recyclerLink}</Link>}
      </section>
    </div>
  )
}

export default HistoryDetailsDialog
