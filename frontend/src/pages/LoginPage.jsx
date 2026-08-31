import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AuthField from '../components/AuthField'
import AuthPageLayout from '../components/AuthPageLayout'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
  const { login } = useAuth()
  const messages = useMessages()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
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
    if (!values.email) nextErrors.email = auth.requiredError
    else if (!emailPattern.test(values.email)) nextErrors.email = auth.emailError
    if (!values.password) nextErrors.password = auth.requiredError
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
      const user = await login(values)
      navigate(location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true })
    } catch {
      setFormError(auth.loginError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout eyebrow={auth.loginEyebrow} title={auth.loginTitle} description={auth.loginDescription}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <AuthField id="login-email" label={auth.email} name="email" type="email" autoComplete="email" value={values.email} onChange={updateField} error={errors.email} />
        <AuthField id="login-password" label={auth.password} name="password" type="password" autoComplete="current-password" value={values.password} onChange={updateField} error={errors.password} />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? auth.signingIn : auth.loginAction} <ArrowRight size={18} /></Button>
        <p className="auth-form__switch">{auth.needsAccount} <Link to="/sign-up">{auth.signupAction}</Link></p>
        <p className="auth-form__development-note">{auth.developmentNote}</p>
      </form>
    </AuthPageLayout>
  )
}

export default LoginPage
