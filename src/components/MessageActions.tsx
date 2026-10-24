import { useState } from 'react'
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'

export function MessageActions({
  content,
  onRegenerate,
}: {
  content: string
  onRegenerate?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  const btn =
    'flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel2 hover:text-soft'

  return (
    <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
      <button className={btn} onClick={copy} title="Copiar" aria-label="Copiar">
        {copied ? <Check size={15} className="text-miku" /> : <Copy size={15} />}
      </button>
      {onRegenerate && (
        <button className={btn} onClick={onRegenerate} title="Regenerar" aria-label="Regenerar">
          <RefreshCw size={15} />
        </button>
      )}
      <button
        className={btn + (vote === 'up' ? ' text-miku' : '')}
        onClick={() => setVote(vote === 'up' ? null : 'up')}
        title="Me gusta"
        aria-label="Me gusta"
      >
        <ThumbsUp size={15} />
      </button>
      <button
        className={btn + (vote === 'down' ? ' text-soft' : '')}
        onClick={() => setVote(vote === 'down' ? null : 'down')}
        title="No me gusta"
        aria-label="No me gusta"
      >
        <ThumbsDown size={15} />
      </button>
    </div>
  )
}
