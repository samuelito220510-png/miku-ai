import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Paperclip, Mic, ArrowUp, FileText, X } from 'lucide-react'

interface Props {
  onSend: (text: string, file?: { name: string; content: string }) => void
  disabled?: boolean
  listening?: boolean
  voiceAvailable?: boolean
  onToggleVoice?: () => void
}

export function ChatComposer({ onSend, disabled, listening, voiceAvailable, onToggleVoice }: Props) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState<{ name: string; content: string } | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 168) + 'px'
  }, [value])

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 1_000_000) {
      alert('El archivo es muy grande (máximo 1 MB de texto).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setFile({ name: f.name, content: String(reader.result || '') })
    reader.onerror = () => alert('No se pudo leer el archivo.')
    reader.readAsText(f)
  }

  const submit = () => {
    const t = value.trim()
    if ((!t && !file) || disabled) return
    onSend(t, file ?? undefined)
    setValue('')
    setFile(null)
  }

  const hasContent = value.trim().length > 0 || !!file

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="mx-auto max-w-3xl">
        {file && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-xl border border-miku/40 bg-miku/10 px-3 py-1.5 text-sm text-miku">
            <FileText size={15} />
            <span className="max-w-[220px] truncate">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-muted transition-colors hover:text-soft"
              title="Quitar archivo"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-line/70 bg-panel/70 p-2 backdrop-blur-xl transition-all focus-within:border-miku/50 focus-within:shadow-glow-sm">
          <button
            type="button"
            title="Adjuntar archivo de texto"
            onClick={() => fileRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel2 hover:text-soft"
          >
            <Paperclip size={19} />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.markdown,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.xml,.yml,.yaml,.log,.srt,.rtf,text/*"
            onChange={handleFile}
          />

          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            rows={1}
            placeholder="Escríbele algo a Miku…"
            className="scroll-thin max-h-44 flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] text-soft placeholder:text-muted/80 focus:outline-none"
          />

          {voiceAvailable && (
            <button
              type="button"
              onClick={onToggleVoice}
              title="Hablar por voz"
              className={
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ' +
                (listening
                  ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/50'
                  : 'text-muted hover:bg-panel2 hover:text-soft')
              }
            >
              <Mic size={19} />
            </button>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!hasContent || disabled}
            title="Enviar"
            className={
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ' +
              (hasContent && !disabled
                ? 'bg-gradient-to-br from-miku to-cyan text-bg shadow-glow-sm hover:scale-105'
                : 'bg-panel2 text-muted')
            }
          >
            <ArrowUp size={19} strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted/70">
          para que sepas siempre que te amo princesa y para que me tengas para siempre en tu corazon
        </p>
      </div>
    </div>
  )
}
