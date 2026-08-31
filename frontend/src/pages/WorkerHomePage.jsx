import { AlertTriangle, ArrowUpRight, MapPinned, ScanLine, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Card from '../components/Card'
import PageIntro from '../components/PageIntro'
import RiskBadge from '../components/RiskBadge'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { getNearbyRecyclers } from '../services/recyclerService'
import { getScanHistory, getWorkerSummary } from '../services/scanService'

function formatShortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function WorkerHomePage() {
  const { user } = useAuth()
  const messages = useMessages()
  const [summary, setSummary] = useState(null)
  const [recentScans, setRecentScans] = useState(null)
  const [recyclers, setRecyclers] = useState(null)
  const { dashboard } = messages

  useEffect(() => {
    Promise.all([getWorkerSummary(), getScanHistory(), getNearbyRecyclers()]).then(([workerSummary, scans, recyclerList]) => {
      setSummary(workerSummary)
      setRecentScans(scans.slice(0, 3))
      setRecyclers(recyclerList.slice(0, 2))
    })
  }, [])

  const activity = [
    { value: summary?.scansThisWeek, label: dashboard.metrics[0], Icon: ScanLine },
    { value: summary?.highRiskFindings, label: dashboard.metrics[1], Icon: AlertTriangle, alert: true },
    { value: summary?.nearbyRecyclers, label: dashboard.metrics[2], Icon: MapPinned },
  ]

  return (
    <div className="dashboard page-stack">
      <PageIntro eyebrow={dashboard.eyebrow} title={dashboard.welcome.replace('{name}', user?.name || 'there')} description={dashboard.description} />

      <Link className="dashboard-new-scan" to="/dashboard/scan">
        <span className="dashboard-new-scan__icon"><ScanLine size={31} /></span>
        <span><strong>{dashboard.newScan}</strong><small>{dashboard.newScanDescription}</small></span>
        <ArrowUpRight size={22} aria-hidden="true" />
      </Link>

      <section className="summary-grid" aria-label="Your activity">
        {activity.map(({ value, label, Icon, alert }) => (
          <Card key={label}><span className={`summary-grid__icon${alert ? ' summary-grid__icon--alert' : ''}`}><Icon size={19} /></span><strong>{value ?? '—'}</strong><span>{label}</span></Card>
        ))}
      </section>

      <section className="dashboard-columns">
        <Card className="dashboard-recent">
          <div className="section-row"><div><p className="eyebrow">{dashboard.recentEyebrow}</p><h2>{dashboard.recentTitle}</h2></div><Link to="/dashboard/history">{dashboard.historyLink}</Link></div>
          <div className="dashboard-recent__list">
            {!recentScans && <p className="dashboard-loading">Loading recent checks…</p>}
            {recentScans?.map((scan) => (
              <article className="dashboard-recent__item" key={scan.id}>
                <div><h3>{scan.detectedItem}</h3><p>{formatShortDate(scan.timestamp)}</p></div>
                <RiskBadge level={scan.riskLevel} />
              </article>
            ))}
          </div>
        </Card>

        <Card className="dashboard-reminders">
          <p className="eyebrow">{dashboard.remindersEyebrow}</p>
          <ul>{dashboard.reminders.map((reminder) => <li key={reminder}><ShieldCheck size={17} aria-hidden="true" /> {reminder}</li>)}</ul>
        </Card>
      </section>

      <Card className="dashboard-recyclers">
        <div><p className="eyebrow">{dashboard.recyclerEyebrow}</p><h2>{dashboard.recyclerTitle}</h2></div>
        <div className="dashboard-recyclers__list">
          {!recyclers && <p className="dashboard-loading">Loading recycler pathways…</p>}
          {recyclers?.map((recycler) => <p key={recycler.id}><MapPinned size={17} /> <span><strong>{recycler.facilityName}</strong>{recycler.address} · {recycler.distanceKm} km away</span></p>)}
        </div>
        <Link className="button button--secondary" to="/dashboard/recyclers">{dashboard.recyclerLink} <ArrowUpRight size={17} /></Link>
      </Card>
    </div>
  )
}

export default WorkerHomePage
