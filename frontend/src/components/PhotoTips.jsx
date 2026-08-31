import { CircleHelp } from 'lucide-react'

function PhotoTips({ title, tips }) {
  return (
    <details className="photo-tips">
      <summary><CircleHelp size={19} /> {title}</summary>
      <ul>{tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
    </details>
  )
}

export default PhotoTips
