import { useState } from 'react'
import SectionCard from '../components/SectionCard'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'

/**
 * Login — Screen 1 of ResolvePath AI.
 *
 * Props:
 *   onLogin — handler called with email string on successful login
 */
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Please enter your password'
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onLogin(email.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="login-page" onKeyDown={handleKeyDown}>
      <div className="login-branding">
        <div className="login-branding-logo">ResolvePath</div>
        <div className="login-branding-tagline">Make complex decisions clearer. You decide.</div>
        <div className="login-branding-features">Compare options &middot; Understand trade-offs &middot; Decide with clarity</div>
      </div>

      <div className="login-card">
        <SectionCard title="Sign In" description="Enter your details to continue.">
          <FormInput
            label="Email"
            value={email}
            onChange={(val) => { setEmail(val); setErrors((prev) => ({ ...prev, email: '' })) }}
            placeholder="you@example.com"
            type="email"
            error={errors.email}
            required
          />
          <FormInput
            label="Password"
            value={password}
            onChange={(val) => { setPassword(val); setErrors((prev) => ({ ...prev, password: '' })) }}
            placeholder="Enter your password"
            type="password"
            error={errors.password}
            required
          />
          <div style={{ marginTop: '12px' }}>
            <PrimaryButton onClick={handleSubmit} variant="primary">
              Sign In
            </PrimaryButton>
          </div>

          <div className="login-card-footer">
            This is a university MVP demonstration. No real authentication is performed.
            Your data is processed locally in your browser and is not sent to a server.
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default Login