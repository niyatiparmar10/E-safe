import { ImagePlus } from 'lucide-react'
import { useRef } from 'react'
import { scanImageConfig } from '../config/scanConfig'

function ImageUploader({ title, description, actionLabel, onSelect, disabled = false, compact = false }) {
  const inputRef = useRef(null)

  function handleChange(event) {
    const [file] = event.target.files
    if (file) onSelect(file)
    event.target.value = ''
  }

  return (
    <section className={`image-uploader${compact ? ' image-uploader--compact' : ''}`}>
      <span className="image-uploader__icon"><ImagePlus size={compact ? 20 : 26} /></span>
      <div>
        <h2>{title}</h2>
        {!compact && <p>{description}</p>}
      </div>
      <input ref={inputRef} className="sr-only" type="file" accept={scanImageConfig.acceptAttribute} capture="environment" onChange={handleChange} />
      <button className="button button--secondary" type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>{actionLabel}</button>
    </section>
  )
}

export default ImageUploader
