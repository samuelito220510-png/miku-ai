import { useRef, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Volume2, Palette, UserRound, Upload, Trash2, Check } from 'lucide-react'
import { ACCENTS } from '../lib/store'

interface Props {
  open: boolean
  onClose: () => void
  accent: string
  onAccent: (id: string) => void
  photo: string | null
  onPhoto: (dataUrl: string | null) => void
  voiceEnabled: boolean
  onToggleVoice: (v: boolean) => void
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={'relative h-6 w-11 rounded-full transition-colors ' + (on ? 'bg-miku' : 'bg-panel2')}
    >
      <span
        className={
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ' +
          (on ? 'translate-x-5' : 'translate-x-0.5')
        }
      />
    </button>
  )
}

async function fileToResizedDataURL(file: File, max = 256): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function SettingsPanel({
  open,
  onClose,
  accent,
  onAccent,
  photo,
  onPhoto,
  voiceEnabled,
  onToggleVoice,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      onPhoto(await fileToResizedDataURL(f))
    } catch {
      /* no se pudo procesar la imagen */
    }
    e.target.value = ''
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-bg/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="scroll-thin fixed right-0 top-0 z-40 flex h-full w-[380px] max-w-[92vw] flex-col overflow-y-auto border-l border-line/60 bg-bg2"
          >
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-3.5">
              <span className="font-display font-bold text-soft">Configuración</span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel2 hover:text-soft"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-4">
              {/* Perfil */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-soft">
                  <UserRound size={16} className="text-miku" /> Perfil
                </h4>
                <div className="flex items-center gap-4 rounded-xl border border-line/70 bg-panel/50 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-panel2 ring-1 ring-line">
                    {photo ? (
                      <img src={photo} alt="Foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={26} className="text-muted" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-line/70 bg-panel px-3 py-1.5 text-sm text-soft transition-colors hover:border-miku/40"
                    >
                      <Upload size={15} /> Cambiar foto
                    </button>
                    {photo && (
                      <button
                        onClick={() => onPhoto(null)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-rose-300"
                      >
                        <Trash2 size={15} /> Quitar
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              </section>

              {/* Apariencia */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-soft">
                  <Palette size={16} className="text-miku" /> Color de la interfaz
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(ACCENTS).map(([id, c]) => (
                    <button
                      key={id}
                      onClick={() => onAccent(id)}
                      title={c.label}
                      className={
                        'relative h-9 w-full rounded-lg ring-2 transition ' +
                        (accent === id ? 'ring-white/80' : 'ring-transparent hover:ring-white/30')
                      }
                      style={{ background: `linear-gradient(135deg, rgb(${c.a}), rgb(${c.a2}))` }}
                    >
                      {accent === id && (
                        <Check
                          size={15}
                          className="absolute inset-0 m-auto text-white drop-shadow"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-line/70 bg-panel/50 px-3 py-3">
                  <span className="text-sm text-soft">Tema oscuro</span>
                  <span className="rounded-full bg-miku/10 px-2.5 py-1 text-xs text-miku">
                    Predeterminado
                  </span>
                </div>
              </section>

              {/* Voz y audio */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-soft">
                  <Volume2 size={16} className="text-miku" /> Voz y audio
                </h4>
                <div className="flex items-center justify-between rounded-xl border border-line/70 bg-panel/50 px-3 py-3">
                  <span className="text-sm text-soft">Leer respuestas en voz alta</span>
                  <Toggle on={voiceEnabled} onChange={onToggleVoice} />
                </div>
              </section>
            </div>

            <div className="mt-auto border-t border-line/60 p-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-miku to-cyan py-2.5 font-semibold text-bg shadow-glow-sm transition-transform hover:scale-[1.02]"
              >
                Listo
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
