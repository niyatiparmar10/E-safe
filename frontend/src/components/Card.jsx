function Card({ children, className = '', ...props }) {
  return (
    <section className={`card-surface ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}

export default Card
