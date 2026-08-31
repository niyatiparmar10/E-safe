import { AlertTriangle, CheckCircle2, CircleHelp, OctagonAlert } from 'lucide-react'

const riskConfig = {
  green: { label: 'Green · low concern', Icon: CheckCircle2 },
  amber: { label: 'Amber · check first', Icon: AlertTriangle },
  red: { label: 'Red · stop handling', Icon: OctagonAlert },
  uncertain: { label: 'Uncertain · ask trained person', Icon: CircleHelp },
}

function RiskBadge({ level }) {
  const normalizedLevel = level?.toLowerCase()
  const { label, Icon } = riskConfig[normalizedLevel] || riskConfig.uncertain
  return (
    <span className={`risk-badge risk-badge--${normalizedLevel || 'uncertain'}`}>
      <Icon size={15} aria-hidden="true" />
      {label}
    </span>
  )
}

export default RiskBadge
