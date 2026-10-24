import { AnimatePresence, motion } from 'framer-motion'
import { X, Settings, Check } from 'lucide-react'
import { MikuAvatar } from './MikuAvatar'
import type { Personality } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  personalities: Personality[]
  activeId: string
  onChange: (id: string) => void
  tone: number
  onToneChange: (pitch: number) => void
  onOpenSettings: () => void
}

const tones = [
  { label: 'Suave', value: 1.0 },
  { label: 'Normal', value: 1.4 },
  { label: 'Aguda', value: 1.8 },
]

export function PersonalityPanel({
  open,
  onClose,
  personalities,
  activeId,
  onChange,
  tone,
  onToneChange,
  onOpenSettings,
}: Props) {
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
            className="scroll-thin fixed right-0 top-0 z-40 flex h-full w-[340px] max-w-[88vw] flex-col overflow-y-auto border-l border-line/60 bg-bg2"
          >
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-3.5">
              <span className="font-display font-bold text-soft">Personalizar Miku</span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel2 hover:text-soft"
              >
                <X size={18} />
              </button>
            </div>

            {/* Perfil */}
            <div className="flex flex-col items-center px-4 pb-4 pt-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-miku/20 blur-xl" />
                <MikuAvatar size={96} />
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-soft">Hatsune Miku</h3>
              <span className="mt-1 rounded-full border border-miku/30 bg-miku/10 px-3 py-0.5 text-xs text-miku">
                Asistente virtual
              </span>
            </div>

            {/* Personalidad */}
            <div className="px-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted/70">
                Personalidad
              </p>
              <div className="grid grid-cols-2 gap-2">
                {personalities.map((p) => {
                  const active = p.id === activeId
                  return (
                    <button
                      key={p.id}
                      onClick={() => onChange(p.id)}
                      className={
                        'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ' +
                        (active
                          ? 'border-miku/60 bg-miku/10'
                          : 'border-line/70 bg-panel/50 hover:border-miku/30')
                      }
                    >
                      <span className="flex w-full items-center justify-between">
                        <p.icon size={18} className={active ? 'text-miku' : 'text-muted'} />
                        {active && <Check size={15} className="text-miku" />}
                      </span>
                      <span className="text-sm font-medium text-soft">{p.name}</span>
                      <span className="text-xs leading-tight text-muted">{p.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tono de voz */}
            <div className="px-4 pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted/70">
                Tono de voz
              </p>
              <div className="flex gap-1 rounded-xl border border-line/70 bg-panel/50 p-1">
                {tones.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => onToneChange(t.value)}
                    className={
                      'flex-1 rounded-lg py-2 text-sm transition-colors ' +
                      (Math.abs(tone - t.value) < 0.01
                        ? 'bg-miku/15 text-miku'
                        : 'text-muted hover:text-soft')
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-2 p-4">
              <button
                onClick={onOpenSettings}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line/70 bg-panel/60 py-2.5 text-sm text-soft transition-colors hover:border-miku/40"
              >
                <Settings size={16} />
                Ajustes avanzados
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-miku to-cyan py-2.5 font-semibold text-bg shadow-glow-sm transition-transform hover:scale-[1.02]"
              >
                Guardar preferencias
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
