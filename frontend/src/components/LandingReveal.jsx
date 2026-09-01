import { motion, useReducedMotion } from 'motion/react'

const motionElements = {
  article: motion.article,
  aside: motion.aside,
  div: motion.div,
}

/**
 * Landing-page-only scroll reveal. Keeping this small wrapper here makes the
 * public storytelling motion consistent without affecting product screens.
 */
function LandingReveal({ as = 'div', children, className, delay = 0, distance = 22, lift = false }) {
  const prefersReducedMotion = useReducedMotion()
  const MotionElement = motionElements[as] || motion.div

  return (
    <MotionElement
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: distance }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion || !lift ? undefined : { y: -4 }}
      viewport={{ amount: 0.2, once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionElement>
  )
}

export default LandingReveal
