function PageIntro({ eyebrow, title, description, children }) {
  return (
    <header className="page-intro">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-intro__description">{description}</p>}
      {children}
    </header>
  )
}

export default PageIntro
