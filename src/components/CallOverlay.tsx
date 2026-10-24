import { AnimatePresence, motion } from 'framer-motion'
import { PhoneOff, Mic, Loader2, Volume2 } from 'lucide-react'
import { MikuAvatar } from './MikuAvatar'

export type CallStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

export function CallOverlay({
  active,
  status,
  onEnd,
}: {
  active: boolean
  status: CallStatus
  onEnd: () => void
}) {
  const label =
    status === 'listening'
      ? 'Escuchando…'
      : status === 'thinking'
        ? 'Pensando…'
        : status === 'speaking'
          ? 'Miku está hablando…'
          : 'Conectando…'

  const pulsing = status === 'listening' || status === 'speaking'

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-bg/95 px-6 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-miku/20 blur-3xl" />

          <div className="relative flex items-center justify-center">
            {pulsing &&
              [0, 1].map((i) => (
                <span
                  key={i}
                  className="pointer-events-none absolute h-40 w-40 rounded-full border border-miku/40"
                  style={{ animation: `ringPulse 2.4s ease-out ${i * 1.2}s infinite` }}
                />
              ))}
            <MikuAvatar size={160} className={status === 'speaking' ? 'animate-floaty' : ''} />
          </div>

          <div className="relative text-center">
            <h2 className="font-display text-2xl font-bold text-soft">Hatsune Miku</h2>
            <p className="mt-2 flex items-center justify-center gap-2 text-miku">
              {status === 'listening' && <Mic size={18} />}
              {status === 'thinking' && <Loader2 size={18} className="animate-spin" />}
              {status === 'speaking' && <Volume2 size={18} />}
              {label}
            </p>
          </div>

          <button
            onClick={onEnd}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            title="Colgar"
          >
            <PhoneOff size={26} />
          </button>

          <p className="relative text-center text-xs text-muted">
            Habla y Miku te responderá sola. Toca el botón rojo para colgar.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
