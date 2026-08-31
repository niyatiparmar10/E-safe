import { ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { useMessages } from '../hooks/useMessages'

function AuthPageLayout({ eyebrow, title, description, children }) {
  const prefersReducedMotion = useReducedMotion()
  const messages = useMessages()

  return (
    <main className="auth-page shell-width">
      <motion.aside
        className="auth-page__context"
        initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link className="auth-page__home" to="/">← {messages.auth.backHome}</Link>
        <span className="auth-page__signal"><ShieldCheck size={22} /></span>
        <p className="eyebrow">E-Safe worker access</p>
        <h1>Safer handling starts with a clear next step.</h1>
        <p>Use one focused safety check to make a more informed decision before opening, storing or moving an electronic item.</p>
      </motion.aside>
      <motion.section
        className="auth-form-panel"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="auth-form-panel__description">{description}</p>
        {children}
      </motion.section>
    </main>
  )
}

export default AuthPageLayout
