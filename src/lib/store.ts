import type { Conversation } from '../types'

const CHATS_KEY = 'mikuai.chats'
const PREFS_KEY = 'mikuai.prefs'

export interface Prefs {
  accent: string
  photo: string | null
  voice: boolean
}

export const ACCENTS: Record<string, { label: string; a: string; a2: string }> = {
  turquesa: { label: 'Turquesa', a: '57 230 209', a2: '0 207 200' },
  rosa: { label: 'Rosa', a: '255 111 181', a2: '236 72 153' },
  morado: { label: 'Morado', a: '167 139 250', a2: '139 92 246' },
  azul: { label: 'Azul', a: '56 189 248', a2: '14 165 233' },
  verde: { label: 'Verde', a: '52 211 153', a2: '16 185 129' },
  durazno: { label: 'Durazno', a: '251 146 120', a2: '244 114 100' },
}

export const defaultPrefs: Prefs = { accent: 'turquesa', photo: null, voice: false }

export function loadPrefs(): Prefs {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch {
    return { ...defaultPrefs }
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* almacenamiento no disponible */
  }
}

export function applyAccent(accent: string) {
  const a = ACCENTS[accent] ?? ACCENTS.turquesa
  const root = document.documentElement
  root.style.setProperty('--c-accent', a.a)
  root.style.setProperty('--c-accent2', a.a2)
}

export function loadChats(): Conversation[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function saveChats(chats: Conversation[]) {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  } catch {
    /* almacenamiento no disponible */
  }
}
