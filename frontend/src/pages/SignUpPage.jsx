import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AuthField from '../components/AuthField'
import AuthPageLayout from '../components/AuthPageLayout'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useMessages } from '../hooks/useMessages'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignUpPage() {
  const { signup } = useAuth()
  const { languages, setLanguage } = useLanguage()
  const messages = useMessages()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', preferredLanguage: 'en' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { auth } = messages

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = auth.requiredError
    if (!values.email) nextErrors.email = auth.requiredError
    else if (!emailPattern.test(values.email)) nextErrors.email = auth.emailError
    if (!values.password) nextErrors.password = auth.requiredError
    else if (values.password.length < 8) nextErrors.password = auth.passwordLengthError
    if (!values.confirmPassword) nextErrors.confirmPassword = auth.requiredError
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = auth.passwordMatchError
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      await signup(values)
      setLanguage(values.preferredLanguage)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch {
      setFormError(auth.signupError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout eyebrow={auth.signupEyebrow} title={auth.signupTitle} description={auth.signupDescription}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <AuthField id="signup-name" label={auth.fullName} name="name" type="text" autoComplete="name" value={values.name} onChange={updateField} error={errors.name} />
        <AuthField id="signup-email" label={auth.email} name="email" type="email" autoComplete="email" value={values.email} onChange={updateField} error={errors.email} />
        <AuthField id="signup-password" label={auth.password} name="password" type="password" autoComplete="new-password" value={values.password} onChange={updateField} error={errors.password} />
        <AuthField id="signup-confirm-password" label={auth.confirmPassword} name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={updateField} error={errors.confirmPassword} />
        <label className="form-field" htmlFor="signup-language">
          <span>{auth.preferredLanguage}</span>
          <select id="signup-language" name="preferredLanguage" value={values.preferredLanguage} onChange={updateField}>
            {(languages.length ? languages : [{ code: 'en', label: 'English' }]).map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
          </select>
        </label>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? auth.creatingAccount : auth.signupAction} <ArrowRight size={18} /></Button>
        <p className="auth-form__switch">{auth.hasAccount} <Link to="/login">{auth.loginAction}</Link></p>
        <p className="auth-form__development-note">{auth.developmentNote}</p>
      </form>
    </AuthPageLayout>
  )
}

export default SignUpPage
