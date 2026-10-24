import { motion } from 'framer-motion'
import type { Suggestion } from '../types'

export function SuggestionCard({ item, onClick }: { item: Suggestion; onClick: () => void }) {
  const Icon = item.icon
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-full items-start gap-3 rounded-2xl border border-line/70 bg-panel/60 p-4 text-left transition-colors hover:border-miku/50 hover:bg-panel2/80"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-miku/10 text-miku ring-1 ring-miku/20 transition-colors group-hover:bg-miku/20">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold text-soft">{item.title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{item.description}</span>
      </span>
    </motion.button>
  )
}
