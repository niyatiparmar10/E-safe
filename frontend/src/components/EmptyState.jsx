import { CircleDashed } from 'lucide-react'

function EmptyState({ icon: Icon = CircleDashed, title, description, children }) {
  return (
    <section className="empty-state">
      <span className="empty-state__icon"><Icon size={26} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  )
}

export default EmptyState
