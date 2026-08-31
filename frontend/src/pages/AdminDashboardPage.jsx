import { AlertCircle, BarChart3, CircleHelp, OctagonAlert, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import RiskBadge from '../components/RiskBadge'
import { useMessages } from '../hooks/useMessages'
import { getAdminDashboardData } from '../services/adminService'

function formatShortDate(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function AdminDashboardPage() {
  const { admin } = useMessages()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const dashboardData = await getAdminDashboardData()
      setData(dashboardData)
      setError('')
    } catch {
      setError(admin.errorDescription)
    }
  }, [admin.errorDescription])

  useEffect(() => { void Promise.resolve().then(loadData) }, [loadData])

  const riskRows = useMemo(() => data ? Object.entries(data.riskCounts) : [], [data])
  const metrics = [
    { label: admin.totalScans, value: data?.totalScans, Icon: BarChart3 },
    { label: admin.escalated, value: data?.uncertainOrEscalated, Icon: ShieldAlert },
    { label: admin.failures, value: data?.analysisFailures, Icon: CircleHelp },
  ]

  return (
    <div className="admin-dashboard page-stack" id="overview">
      <PageIntro eyebrow={admin.dashboardEyebrow} title={admin.dashboardTitle} description={admin.dashboardDescription} />
      {error && <EmptyState icon={AlertCircle} title={admin.errorTitle} description={error}><button className="button button--secondary" type="button" onClick={loadData}>{admin.retry}</button></EmptyState>}
      {!error && !data && <p className="admin-loading">{admin.loading}</p>}
      {!error && data && <>
        <section className="admin-metrics" aria-label="Anonymous usage summary">
          {metrics.map(({ label, value, Icon }) => <Card key={label}><Icon size={21} /><strong>{value ?? '—'}</strong><span>{label}</span></Card>)}
        </section>
        <section className="admin-insight-grid">
          <Card className="admin-risk-distribution"><p className="eyebrow">{admin.riskDistribution}</p><div>{riskRows.map(([level, count]) => <div className="admin-risk-row" key={level}><RiskBadge level={level} /><span className="admin-risk-row__bar" aria-label={`${level}: ${count} scans`}><i style={{ width: `${Math.max(7, Math.round((count / data.totalScans) * 100))}%` }} /></span><strong>{count}</strong></div>)}</div></Card>
          <Card className="admin-item-classes"><p className="eyebrow">{admin.itemClasses}</p><ul>{data.supportedItemClasses.map((item) => <li key={item.label}><span>{item.label}</span><strong>{item.count}</strong></li>)}</ul></Card>
        </section>
        <Card className="admin-issues"><p className="eyebrow">{admin.recentIssues}</p><ul>{data.recentIssues.map((issue) => <li key={issue.id}><span className="admin-issues__icon"><OctagonAlert size={17} /></span><div><strong>{issue.type}</strong><p>{issue.detail}</p></div><time>{formatShortDate(issue.timestamp)}</time></li>)}</ul></Card>
        <Card className="admin-notice"><p className="eyebrow">{admin.mockBoundary}</p><h2><ShieldCheck size={20} /> {admin.mockNotice}</h2></Card>
      </>}
    </div>
  )
}

export default AdminDashboardPage
