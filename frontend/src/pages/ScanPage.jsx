import { Camera } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import CameraCapture from '../components/CameraCapture'
import ImagePreview from '../components/ImagePreview'
import ImageUploader from '../components/ImageUploader'
import PageIntro from '../components/PageIntro'
import PhotoTips from '../components/PhotoTips'
import ScanProgress from '../components/ScanProgress'
import { useMessages } from '../hooks/useMessages'
import { useScanFlow } from '../hooks/useScanFlow'
import { checkImageDimensions, validateImageFile } from '../utils/imageValidation'

function ScanPage() {
  const messages = useMessages()
  const { currentScan, startScan, clearScan } = useScanFlow()
  const navigate = useNavigate()
  const canResumePhoto = Boolean(currentScan?.photoUrl && currentScan.status !== 'result')
  const [mode, setMode] = useState(() => (canResumePhoto ? 'preview' : 'choose'))
  const [selectedPhoto, setSelectedPhoto] = useState(() => (canResumePhoto ? {
    file: currentScan.photoFile,
    source: 'resume',
    url: currentScan.photoUrl,
  } : null))
  const [pageError, setPageError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [saveToHistory, setSaveToHistory] = useState(() => Boolean(currentScan?.saveToHistory))
  const [isContinuing, setIsContinuing] = useState(false)
  const keepsPreviewUrl = useRef(canResumePhoto)
  const { scan } = messages

  useEffect(() => () => {
    if (selectedPhoto?.url && !keepsPreviewUrl.current) URL.revokeObjectURL(selectedPhoto.url)
  }, [selectedPhoto])

  async function handlePhoto(file, source) {
    setPageError('')
    const fileCheck = validateImageFile(file)
    if (!fileCheck.valid) {
      setPageError(scan.errors[fileCheck.error])
      return
    }

    setIsValidating(true)
    const dimensionCheck = await checkImageDimensions(file)
    setIsValidating(false)
    if (!dimensionCheck.valid) {
      setPageError(scan.errors[dimensionCheck.error])
      return
    }

    if (currentScan?.photoUrl) clearScan()
    keepsPreviewUrl.current = false
    setSelectedPhoto((previousPhoto) => {
      if (previousPhoto?.url) URL.revokeObjectURL(previousPhoto.url)
      return { file, source, url: URL.createObjectURL(file) }
    })
    setMode('preview')
  }

  function resetPhoto(nextMode = 'choose') {
    if (currentScan?.photoUrl) clearScan()
    keepsPreviewUrl.current = false
    setSelectedPhoto((previousPhoto) => {
      if (previousPhoto?.url) URL.revokeObjectURL(previousPhoto.url)
      return null
    })
    setPageError('')
    setMode(nextMode)
  }

  const handleCameraError = useCallback((errorKey) => {
    setPageError(scan.errors[errorKey])
  }, [scan.errors])

  function continueToContext() {
    if (!selectedPhoto) return
    setIsContinuing(true)
    keepsPreviewUrl.current = true
    startScan(selectedPhoto.file, { previewUrl: selectedPhoto.url, saveToHistory })
    navigate('/scan/context')
  }

  return (
    <div className="scan-page page-stack">
      <PageIntro eyebrow={scan.eyebrow} title={scan.title} description={scan.description} />
      <ScanProgress steps={scan.progress} />

      {pageError && <p className="scan-page__error" role="alert">{pageError}</p>}

      {mode === 'preview' && selectedPhoto ? (
        <ImagePreview
          imageUrl={selectedPhoto.url}
          title={scan.previewTitle}
          description={scan.previewDescription}
          source={selectedPhoto.source}
          retakeLabel={scan.retake}
          replaceLabel={scan.replace}
          useLabel={scan.usePhoto}
          onRetake={() => resetPhoto(selectedPhoto.source === 'camera' ? 'camera' : 'choose')}
          onUse={continueToContext}
          isSubmitting={isContinuing}
        >
          <label className="privacy-control">
            <input type="checkbox" checked={saveToHistory} onChange={(event) => setSaveToHistory(event.target.checked)} />
            <span><strong>{scan.privacyLabel}</strong><small>{scan.privacyDescription}</small></span>
          </label>
        </ImagePreview>
      ) : mode === 'camera' ? (
        <CameraCapture copy={scan} onCapture={(file) => handlePhoto(file, 'camera')} onError={handleCameraError} onUseUpload={() => setMode('choose')} />
      ) : (
        <section className="scan-source-grid" aria-label="Choose a photo source">
          <article className="scan-source-card scan-source-card--camera">
            <span className="scan-source-card__icon"><Camera size={28} /></span>
            <h2>{scan.cameraAction}</h2>
            <p>{scan.description}</p>
            <button className="button button--primary" type="button" onClick={() => setMode('camera')}><Camera size={18} /> {scan.cameraAction}</button>
          </article>
          <ImageUploader title={scan.uploadTitle} description={scan.uploadDescription} actionLabel={scan.uploadAction} onSelect={(file) => handlePhoto(file, 'upload')} disabled={isValidating} />
        </section>
      )}

      {isValidating && <p className="scan-page__status">Checking that the image opens correctly…</p>}
      <PhotoTips title={scan.tipsTitle} tips={scan.tips} />
    </div>
  )
}

export default ScanPage
