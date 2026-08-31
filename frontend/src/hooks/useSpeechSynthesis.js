import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from './useLanguage'

const speechLocales = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

export function useSpeechSynthesis() {
  const { language } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const locale = speechLocales[language] || speechLocales.en

  useEffect(() => {
    if (!isSupported) return undefined
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices())
    updateVoices()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices)
      window.speechSynthesis.cancel()
    }
  }, [isSupported])

  const voice = useMemo(
    () => voices.find((candidate) => candidate.lang.toLowerCase() === locale.toLowerCase())
      || voices.find((candidate) => candidate.lang.toLowerCase().startsWith(language))
      || null,
    [language, locale, voices],
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  const speak = useCallback((text) => {
    if (!isSupported || !text) return false
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = voice?.lang || locale
    utterance.voice = voice
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
    return true
  }, [isSupported, locale, voice])

  return { isSupported, isSpeaking, speak, stop }
}
