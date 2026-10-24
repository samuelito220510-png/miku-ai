import { motion } from 'framer-motion'
import { MikuAvatar } from './MikuAvatar'
import { SuggestionCard } from './SuggestionCard'
import { suggestions } from '../data/demo'

export function WelcomeScreen({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-5 py-10">
      {/* Fondo holográfico */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-miku/15 blur-3xl" />

      {/* Ilustración de Miku */}
      <div className="relative mb-6 flex items-end justify-center">
        <div className="pointer-events-none absolute bottom-6 h-56 w-56 rounded-full bg-cyan/15 blur-2xl" />
        {[0, 1].map((i) => (
          <span
            key={i}
            className="pointer-events-none absolute bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-miku/20"
            style={{ animation: `ringPulse 3.6s ease-out ${i * 1.8}s infinite` }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <MikuAvatar variant="bare" className="relative h-60 w-auto animate-floaty drop-shadow-[0_12px_30px_rgba(57,230,209,0.25)]" />
        </motion.div>
      </div>

      {/* Texto de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mb-8 max-w-xl text-center"
      >
        <h1 className="font-display text-3xl font-extrabold text-soft sm:text-4xl">
          ¡Hola! Soy <span className="text-miku text-glow">Hatsune Miku</span> ✨
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Estoy aquí para conversar contigo, ayudarte con tus ideas y acompañarte en lo que
          necesites. ¿Qué hacemos hoy?
        </p>
      </motion.div>

      {/* Tarjetas de sugerencia */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {suggestions.map((s) => (
          <motion.div
            key={s.title}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          >
            <SuggestionCard item={s} onClick={() => onPick(s.prompt)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
