import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Info, PanelLeftOpen, Check } from 'lucide-react'
import { MikuAvatar } from './MikuAvatar'
import type { Personality } from '../types'

interface Props {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  personalities: Personality[]
  activePersonality: Personality
  onChangePersonality: (id: string) => void
  onOpenPanel: () => void
}

export function TopBar({
  sidebarCollapsed,
  onToggleSidebar,
  personalities,
  activePersonality,
  onChangePersonality,
  onOpenPanel,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-20 flex h-16 items-center gap-3 border-b border-line/60 bg-bg2/70 px-4 backdrop-blur-xl">
      {sidebarCollapsed && (
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel2 hover:text-soft md:hidden"
        >
          <PanelLeftOpen size={19} />
        </button>
      )}

      <button onClick={onOpenPanel} className="flex items-center gap-3">
        <MikuAvatar size={38} />
        <span className="text-left">
          <span className="block font-display text-sm font-bold leading-tight text-soft">
            Hatsune Miku
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-miku shadow-[0_0_6px_rgb(var(--c-accent))]" />
            Tu compañera virtual
          </span>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Selector de personalidad */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-line/70 bg-panel/60 px-3 py-2 text-sm text-soft transition-colors hover:border-miku/40"
          >
            <activePersonality.icon size={16} className="text-miku" />
            <span className="hidden sm:inline">{activePersonality.name}</span>
            <ChevronDown size={15} className="text-muted" />
          </button>
          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="glass absolute right-0 top-12 z-20 w-56 rounded-2xl p-1.5 shadow-xl"
                >
                  <p className="px-2.5 py-1.5 text-xs uppercase tracking-wider text-muted/70">
                    Personalidad
                  </p>
                  {personalities.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangePersonality(p.id)
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-soft transition-colors hover:bg-panel2"
                    >
                      <p.icon size={16} className="text-miku" />
                      <span className="flex-1">
                        <span className="block">{p.name}</span>
                        <span className="block text-xs text-muted">{p.description}</span>
                      </span>
                      {p.id === activePersonality.id && <Check size={15} className="text-miku" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onOpenPanel}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line/70 bg-panel/60 text-muted transition-colors hover:border-miku/40 hover:text-soft"
          title="Información"
        >
          <Info size={17} />
        </button>
      </div>
    </header>
  )
}
