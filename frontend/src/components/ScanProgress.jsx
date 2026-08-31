function ScanProgress({ steps, activeStep = 0 }) {
  return (
    <ol className="scan-progress" aria-label="Scan progress">
      {steps.map((label, index) => (
        <li className={index === activeStep ? 'is-active' : ''} key={label}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  )
}

export default ScanProgress
