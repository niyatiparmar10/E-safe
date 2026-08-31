import { ArrowLeft, ArrowRight, Check, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { appConfig } from '../config/env'
import Card from '../components/Card'
import PageIntro from '../components/PageIntro'
import ScanProgress from '../components/ScanProgress'
import { useMessages } from '../hooks/useMessages'
import { useScanFlow } from '../hooks/useScanFlow'
import { analyseScan, saveScanResultToHistory, submitScanContext } from '../services/scanService'

function ScanContextPage() {
  const { currentScan, updateScanContext, completeScan } = useScanFlow()
  const messages = useMessages()
  const navigate = useNavigate()
  const { scan } = messages
  const questions = scan.questions
  const [answers, setAnswers] = useState(() => currentScan?.answers || {})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [mockScenario, setMockScenario] = useState('AMBER')
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [error, setError] = useState('')

  if (!currentScan?.photoUrl) return <Navigate to="/dashboard/scan" replace />

  const currentQuestion = questions[questionIndex]
  const answeredCount = Object.keys(answers).length

  function selectAnswer(answer) {
    const nextAnswers = { ...answers, [currentQuestion.id]: answer }
    setAnswers(nextAnswers)
    updateScanContext(nextAnswers)
  }

  function goToNextQuestion() {
    if (!answers[currentQuestion.id]) return
    if (questionIndex === questions.length - 1) {
      setIsReviewing(true)
      return
    }
    setQuestionIndex((index) => index + 1)
  }

  async function handleAnalysis() {
    setError('')
    setIsAnalysing(true)
    try {
      await submitScanContext({ scanId: currentScan.id, answers })
      const result = await analyseScan({
        scanId: currentScan.id,
        answers,
        saveToHistory: currentScan.saveToHistory,
        mockScenario: appConfig.enableMockResultSwitcher ? mockScenario : undefined,
      })
      if (currentScan.saveToHistory) await saveScanResultToHistory(result, currentScan.photoFile)
      completeScan(result)
      navigate('/scan/result')
    } catch {
      setError(scan.contextError)
      setIsAnalysing(false)
    }
  }

  return (
    <div className="scan-context page-stack">
      <PageIntro eyebrow={scan.contextEyebrow} title={scan.contextTitle} description={scan.contextDescription} />
      <ScanProgress steps={scan.progress} activeStep={1} />

      <Card className="context-photo-strip">
        <img src={currentScan.photoUrl} alt="Photo selected for this safety check" />
        <span><ImageIcon size={18} /> {scan.contextPhotoKept}</span>
        <Link to="/dashboard/scan">{scan.contextBackToPhoto}</Link>
      </Card>

      {!isReviewing ? (
        <section className="question-card" aria-labelledby={`question-${currentQuestion.id}`}>
          <p className="eyebrow">{scan.contextQuestionCount.replace('{current}', questionIndex + 1).replace('{total}', questions.length)}</p>
          <h2 id={`question-${currentQuestion.id}`}>{currentQuestion.text}</h2>
          <div className="response-segments" role="group" aria-label={currentQuestion.text}>
            {scan.responseOptions.map((option) => (
              <button
                className={answers[currentQuestion.id] === option ? 'is-selected' : ''}
                key={option}
                type="button"
                aria-pressed={answers[currentQuestion.id] === option}
                onClick={() => selectAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="question-card__actions">
            {questionIndex === 0 ? (
              <Link className="button button--secondary" to="/dashboard/scan"><ArrowLeft size={17} /> {scan.contextBackToPhoto}</Link>
            ) : (
              <button className="button button--secondary" type="button" onClick={() => setQuestionIndex((index) => index - 1)}><ArrowLeft size={17} /> {scan.contextBack}</button>
            )}
            <button className="button button--primary" type="button" disabled={!answers[currentQuestion.id]} onClick={goToNextQuestion}>
              {questionIndex === questions.length - 1 ? scan.contextReview : scan.contextNext} <ArrowRight size={17} />
            </button>
          </div>
        </section>
      ) : (
        <section className="answer-review" aria-labelledby="answer-review-title">
          <div className="answer-review__heading"><div><p className="eyebrow">{scan.contextAnswered.replace('{current}', answeredCount).replace('{total}', questions.length)}</p><h2 id="answer-review-title">{scan.contextReviewTitle}</h2></div><Check size={25} aria-hidden="true" /></div>
          <dl>
            {questions.map((question, index) => (
              <div key={question.id}>
                <dt>{question.text}</dt>
                <dd>{answers[question.id]} <button type="button" onClick={() => { setQuestionIndex(index); setIsReviewing(false) }}>{scan.contextEdit}</button></dd>
              </div>
            ))}
          </dl>
          {appConfig.enableMockResultSwitcher && (
            <aside className="development-scenario">
              <label htmlFor="mock-result-state">{scan.developmentScenarioLabel}</label>
              <select id="mock-result-state" value={mockScenario} onChange={(event) => setMockScenario(event.target.value)}>
                {scan.developmentScenarios.map((scenario) => <option key={scenario.value} value={scenario.value}>{scenario.label}</option>)}
              </select>
              <p>{scan.developmentScenarioHelp}</p>
            </aside>
          )}
          {error && <p className="scan-page__error" role="alert">{error}</p>}
          <div className="answer-review__actions">
            <button className="button button--secondary" type="button" onClick={() => setIsReviewing(false)} disabled={isAnalysing}><ArrowLeft size={17} /> {scan.contextBack}</button>
            <button className="button button--primary" type="button" onClick={handleAnalysis} disabled={isAnalysing}>{isAnalysing ? scan.contextAnalysing : scan.contextAnalyse} <ArrowRight size={17} /></button>
          </div>
        </section>
      )}
    </div>
  )
}

export default ScanContextPage
