import { getMessages } from '../config/messages'
import { useLanguage } from './useLanguage'

export function useMessages() {
  const { language } = useLanguage()
  return getMessages(language)
}
