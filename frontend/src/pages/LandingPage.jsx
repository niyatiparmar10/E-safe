import { ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import LandingReveal from '../components/LandingReveal'
import RiskBadge from '../components/RiskBadge'
import WorkflowDeck from '../components/WorkflowDeck'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'

function LandingPage() {
  const { user } = useAuth()
  const messages = useMessages()
  const prefersReducedMotion = useReducedMotion()
  const { landing } = messages
  const primaryDestination = user ? '/dashboard/scan' : '/sign-up'

  return (
    <main>
      <section className="hero shell-width">
        <motion.div
          className="hero__copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="eyebrow"><span className="live-dot" /> {landing.eyebrow}</p>
          <h1>{landing.titleStart}<br /><em>{landing.titleEmphasis}</em> {landing.titleEnd}</h1>
          <p className="hero__lede">{landing.description}</p>
          <div className="hero__actions">
            <Link className="button button--primary" to={primaryDestination}>{landing.primaryAction} <ArrowRight size={18} /></Link>
            <Link className="text-link" to="/login">{landing.secondaryAction}</Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-panel hero-panel--animated"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.42, delay: 0.08 }}
          aria-label="Example safety result"
        >
          <div className="hero-panel__topline"><span>{landing.preview.label}</span><span>00:16</span></div>
          <div className="hero-panel__stage" aria-hidden="true">
            <div className="item-outline">
              <div className="item-outline__screen" />
              <div className="item-outline__battery" />
              <span className="item-outline__signal item-outline__signal--one" />
              <span className="item-outline__signal item-outline__signal--two" />
            </div>
          </div>
          <div className="hero-panel__result">
            <p>{landing.preview.state}</p>
            <RiskBadge level="amber" />
            <strong>{landing.preview.guidance}</strong>
            <span className="hero-panel__result-meta"><ShieldCheck size={15} aria-hidden="true" /> {landing.preview.guidanceLabel}</span>
          </div>
          <div className="hero-panel__scanline" aria-hidden="true" />
        </motion.div>
      </section>

      <section className="trust-strip">
        <LandingReveal className="shell-width trust-strip__inner" distance={14}>
          <span>ONE ITEM AT A TIME</span><i />
          <span>PLAIN QUESTIONS</span><i />
          <span>CONSERVATIVE DECISIONS</span><i />
          <span>AUTHORISED PATHWAYS</span>
        </LandingReveal>
      </section>

      <section className="how-section shell-width" id="how-it-works">
        <LandingReveal className="section-heading">
          <p className="eyebrow">{landing.workflowEyebrow}</p>
          <h2>{landing.workflowTitle}</h2>
        </LandingReveal>
        <WorkflowDeck steps={landing.workflow} messages={landing} />
      </section>

      <section className="risk-section">
        <div className="shell-width risk-section__inner">
          <LandingReveal className="section-heading">
            <p className="eyebrow">{landing.riskEyebrow}</p>
            <h2>{landing.riskTitle}</h2>
          </LandingReveal>
          <div className="risk-explanations">
            {landing.risks.map(({ level, title, description }, index) => (
              <LandingReveal as="article" className={`risk-explanation risk-explanation--${level} landing-motion-card`} delay={index * 0.08} key={level} lift>
                <div><RiskBadge level={level} /><h3>{title}</h3></div>
                <p>{description}</p>
              </LandingReveal>
            ))}
          </div>
          <LandingReveal as="aside" className="safety-notice landing-motion-card" delay={0.12} lift>
            <ShieldAlert size={21} aria-hidden="true" /><p>{landing.trustMessage}</p>
          </LandingReveal>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
