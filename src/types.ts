import type { LucideIcon } from 'lucide-react'

export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  status?: 'sending' | 'done' | 'error'
  fileName?: string
  display?: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  messages: Message[]
}

export interface Suggestion {
  icon: LucideIcon
  title: string
  description: string
  prompt: string
}

export interface Personality {
  id: string
  name: string
  description: string
  icon: LucideIcon
  systemPrompt: string
}
