import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main className="not-found shell-width">
      <SearchX size={35} aria-hidden="true" />
      <p className="eyebrow">Page not found</p>
      <h1>This route is not part of E-Safe.</h1>
      <Link className="button button--primary" to="/"><ArrowLeft size={18} /> Return home</Link>
    </main>
  )
}

export default NotFoundPage
