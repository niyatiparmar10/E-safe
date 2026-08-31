import { Check, RotateCcw } from 'lucide-react'
import Button from './Button'

function ImagePreview({ imageUrl, title, description, source, retakeLabel, replaceLabel, useLabel, onRetake, onUse, isSubmitting, children }) {
  const secondaryLabel = source === 'camera' ? retakeLabel : replaceLabel

  return (
    <section className="image-preview">
      <div className="image-preview__image"><img src={imageUrl} alt="Selected electronic item for the safety check" /></div>
      <div className="image-preview__content">
        <p className="eyebrow">Photo ready</p>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <div className="image-preview__actions">
          <button className="button button--secondary" type="button" onClick={onRetake}><RotateCcw size={18} /> {secondaryLabel}</button>
          <Button type="button" onClick={onUse} disabled={isSubmitting}><Check size={18} /> {isSubmitting ? 'Preparing…' : useLabel}</Button>
        </div>
      </div>
    </section>
  )
}

export default ImagePreview
