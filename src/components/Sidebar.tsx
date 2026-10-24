import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Compass,
  Library,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  User,
  ChevronDown,
} from 'lucide-react'
import type { Conversation } from '../types'

interface Props {
  collapsed: boolean
  onToggle: () => void
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onOpenPersonality: () => void
  onOpenSettings: () => void
  profilePhoto: string | null
}

const navItems = [
  { id: 'explorar', label: 'Explorar', icon: Compass },
  { id: 'biblioteca', label: 'Biblioteca', icon: Library },
  { id: 'personalizar', label: 'Personalizar Miku', icon: Sparkles },
]

function groupLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, now)) return 'Hoy'
  if (same(d, yest)) return 'Ayer'
  return 'Anteriores'
}

const ORDER = ['Hoy', 'Ayer', 'Anteriores']

function Profile({ photo }: { photo: string | null }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-panel2/70">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-panel2 ring-1 ring-line">
        {photo ? (
          <img src={photo} alt="Fer" className="h-full w-full object-cover" />
        ) : (
          <User size={17} className="text-muted" />
        )}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-medium text-soft">Fer</span>
        <span className="block text-xs text-muted">dueña de sam</span>
      </span>
      <ChevronDown size={16} className="text-muted" />
    </button>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onOpenPersonality,
  onOpenSettings,
  profilePhoto,
}: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(query.toLowerCase()),
    )
    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt)
    const map = new Map<string, Conversation[]>()
    for (const c of sorted) {
      const g = groupLabel(c.createdAt)
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(c)
    }
    return ORDER.filter((o) => map.has(o)).map((o) => [o, map.get(o)!] as [string, Conversation[]])
  }, [conversations, query])

  /* ---------- Rail colapsado ---------- */
  if (collapsed) {
    const railBtn =
      'flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel2 hover:text-soft'
    return (
      <aside className="flex h-full w-[68px] flex-col items-center gap-2 border-r border-line/60 bg-bg2/80 py-4">
        <button onClick={onToggle} className={railBtn} title="Expandir menú">
          <PanelLeftOpen size={20} />
        </button>
        <button
          onClick={onNewChat}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-miku text-bg shadow-glow-sm transition-transform hover:scale-105"
          title="Nuevo chat"
        >
          <Plus size={20} />
        </button>
        <div className="my-1 h-px w-8 bg-line/70" />
        {navItems.map((n) => (
          <button
            key={n.id}
            className={railBtn}
            title={n.label}
            onClick={n.id === 'personalizar' ? onOpenPersonality : undefined}
          >
            <n.icon size={19} />
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button className={railBtn} title="Configuración" onClick={onOpenSettings}>
            <Settings size={19} />
          </button>
          <button onClick={onOpenSettings} title="Fer" className="h-9 w-9 overflow-hidden rounded-full bg-panel2 ring-1 ring-line">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Fer" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <User size={16} className="text-muted" />
              </span>
            )}
          </button>
        </div>
      </aside>
    )
  }

  /* ---------- Sidebar expandida ---------- */
  return (
    <aside className="flex h-full w-[278px] flex-col border-r border-line/60 bg-bg2/80">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-miku to-cyan text-bg shadow-glow-sm">
            <Sparkles size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-soft">
            MIKU<span className="text-miku"> AI</span>
          </span>
        </div>
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel2 hover:text-soft"
          title="Contraer menú"
        >
          <PanelLeftClose size={19} />
        </button>
      </div>

      <div className="px-3 pt-2">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-miku to-cyan py-2.5 font-semibold text-bg shadow-glow-sm transition-transform hover:scale-[1.02] active:scale-100"
        >
          <Plus size={18} strokeWidth={2.4} />
          Nuevo chat
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-panel/60 px-3 py-2 focus-within:border-miku/50">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversaciones"
            className="w-full bg-transparent text-sm text-soft placeholder:text-muted/80 focus:outline-none"
          />
        </div>
      </div>

      <div className="scroll-thin mt-3 flex-1 overflow-y-auto px-2">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-3">
            <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted/70">
              {group}
            </p>
            {items.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={
                  'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ' +
                  (activeId === c.id
                    ? 'bg-miku/10 text-soft'
                    : 'text-muted hover:bg-panel2/70 hover:text-soft')
                }
              >
                <MessageSquare
                  size={15}
                  className={activeId === c.id ? 'text-miku' : 'text-muted group-hover:text-soft'}
                />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted/80">
            Aún no hay chats.
            <br />
            ¡Empieza una conversación con Miku!
          </p>
        )}
        {conversations.length > 0 && groups.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted">Sin resultados</p>
        )}
      </div>

      <div className="border-t border-line/60 px-2 py-2">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={n.id === 'personalizar' ? onOpenPersonality : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-panel2/70 hover:text-soft"
          >
            <n.icon size={17} />
            {n.label}
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-panel2/70 hover:text-soft"
        >
          <Settings size={17} />
          Configuración
        </button>
      </div>

      <div className="border-t border-line/60 p-2">
        <Profile photo={profilePhoto} />
      </div>
    </aside>
  )
}
