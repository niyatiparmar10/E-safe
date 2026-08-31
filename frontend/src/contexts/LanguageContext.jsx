import { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './languageContext'
import { getSupportedLanguages } from '../services/languageService'

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [languages, setLanguages] = useState([])

  useEffect(() => {
    getSupportedLanguages().then(setLanguages)
  }, [])

  const value = useMemo(
    () => ({ language, setLanguage, languages }),
    [language, languages],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
