import { useState } from 'react'
import { Camera, CircleHelp, MapPinned, ShieldAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

const stepIcons = [Camera, CircleHelp, ShieldAlert, MapPinned]
const revealEase = [0.22, 1, 0.36, 1]

function WorkflowDeck({ steps, messages }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const revealWorkflow = () => setIsExpanded(true)

  return (
    <motion.div className={`workflow-deck ${isExpanded ? 'is-expanded' : 'is-stacked'}`} layout>
      <div className="steps-grid steps-grid--four workflow-deck__cards">
        {steps.map(({ number, title, description }, index) => {
          const Icon = stepIcons[index]
          const stackedPosition = {
            opacity: 1,
            rotate: (index - 1.5) * 0.45,
            scale: 1 - index * 0.018,
            y: index * 17,
          }

          return (
            <motion.button
              className="step-card workflow-deck__card"
              type="button"
              key={number}
              layout
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
              whileInView={prefersReducedMotion ? undefined : (isExpanded ? { opacity: 1, rotate: 0, scale: 1, y: 0 } : stackedPosition)}
              whileHover={prefersReducedMotion || !isExpanded ? undefined : { y: -4 }}
              viewport={{ amount: 0.2, once: true }}
              transition={{ delay: isExpanded ? index * 0.05 : index * 0.06, duration: 0.52, ease: revealEase }}
              onClick={revealWorkflow}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? title : messages.workflowDeckAction}
            >
              <div className="step-card__meta"><span>{number}</span><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.button>
          )
        })}
      </div>
      <p className="workflow-deck__hint" aria-live="polite">
        {isExpanded ? messages.workflowDeckOpen : messages.workflowDeckHint}
      </p>
    </motion.div>
  )
}

export default WorkflowDeck
