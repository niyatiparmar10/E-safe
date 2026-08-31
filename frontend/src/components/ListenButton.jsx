import { Square, Volume2 } from 'lucide-react'
import { useMessages } from '../hooks/useMessages'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

function ListenButton({ text }) {
  const { scan } = useMessages()
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis()

  if (!isSupported) {
    return <button className="listen-button" type="button" disabled title={scan.resultAudioUnavailable}><Volume2 size={17} /> {scan.resultAudioUnavailable}</button>
  }

  return (
    <button className="listen-button" type="button" onClick={() => (isSpeaking ? stop() : speak(text))}>
      {isSpeaking ? <Square size={15} /> : <Volume2 size={17} />}
      {isSpeaking ? scan.resultStopListening : scan.resultListen}
    </button>
  )
}

export default ListenButton
