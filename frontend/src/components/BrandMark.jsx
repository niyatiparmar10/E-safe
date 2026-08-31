import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

function BrandMark({ to = '/', inverse = false }) {
  return (
    <Link className={`brand-mark${inverse ? ' brand-mark--inverse' : ''}`} to={to} aria-label="E-Safe home">
      <span className="brand-mark__icon"><ShieldCheck size={20} strokeWidth={2.5} /></span>
      <span>E-Safe</span>
    </Link>
  )
}

export default BrandMark
