import { Camera, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from './Button'
import CaptureGuide from './CaptureGuide'

function CameraCapture({ copy, onCapture, onError, onUseUpload }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraStatus, setCameraStatus] = useState('starting')
  const [cameraError, setCameraError] = useState('')

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const reportCameraError = useCallback((errorKey) => {
    setCameraError(copy.errors[errorKey])
    onError?.(errorKey)
  }, [copy.errors, onError])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      reportCameraError('cameraUnavailable')
      setCameraStatus('unavailable')
      return
    }

    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraStatus('ready')
    } catch (error) {
      reportCameraError(error?.name === 'NotAllowedError' ? 'cameraDenied' : 'cameraFailed')
      setCameraStatus('unavailable')
    }
  }, [reportCameraError])

  useEffect(() => {
    const startTimer = window.setTimeout(startCamera, 0)
    return () => {
      window.clearTimeout(startTimer)
      stopCamera()
    }
  }, [startCamera, stopCamera])

  function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video?.videoWidth || !canvas) {
      reportCameraError('captureFailed')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        reportCameraError('captureFailed')
        return
      }
      const file = new File([blob], `e-safe-camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
      stopCamera()
      onCapture(file)
    }, 'image/jpeg', 0.92)
  }

  const cameraIsReady = cameraStatus === 'ready' && !cameraError

  return (
    <section className="camera-capture" aria-label={copy.cameraTitle}>
      <div className="camera-capture__viewport">
        <video ref={videoRef} className={cameraIsReady ? '' : 'is-hidden'} autoPlay playsInline muted />
        {!cameraIsReady && <div className="camera-capture__empty"><Camera size={31} /><p>{cameraStatus === 'starting' ? copy.cameraStarting : copy.cameraFallback}</p></div>}
        <CaptureGuide />
      </div>
      <canvas ref={canvasRef} className="sr-only" />
      {cameraError && <p className="capture-error" role="alert">{cameraError}</p>}
      <div className="camera-capture__actions">
        {cameraIsReady && <Button type="button" className="camera-capture__button" onClick={handleCapture}><Camera size={20} /> {copy.captureAction}</Button>}
        <button className="button button--secondary" type="button" onClick={onUseUpload}><Upload size={18} /> {copy.closeCamera}</button>
      </div>
    </section>
  )
}

export default CameraCapture
