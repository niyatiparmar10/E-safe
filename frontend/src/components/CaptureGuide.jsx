function CaptureGuide() {
  return (
    <div className="capture-guide" aria-hidden="true">
      <span className="capture-guide__corner capture-guide__corner--top-left" />
      <span className="capture-guide__corner capture-guide__corner--top-right" />
      <span className="capture-guide__corner capture-guide__corner--bottom-left" />
      <span className="capture-guide__corner capture-guide__corner--bottom-right" />
      <span className="capture-guide__centre" />
    </div>
  )
}

export default CaptureGuide
