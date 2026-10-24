import { MessageCircle, Wand2, Music, Lightbulb, Smile, Sparkles, Laugh, Moon } from 'lucide-react'
import type { Suggestion, Personality } from '../types'

export const suggestions: Suggestion[] = [
  {
    icon: MessageCircle,
    title: 'Hablemos un rato',
    description: 'Cuéntame cómo te ha ido hoy',
    prompt: 'Hola Miku, quiero contarte cómo me fue hoy.',
  },
  {
    icon: Wand2,
    title: 'Modo creativo',
    description: 'Inventemos historias, ideas y personajes',
    prompt: 'Inventemos juntos una historia original con un personaje interesante.',
  },
  {
    icon: Music,
    title: 'Zona musical',
    description: 'Exploremos canciones y conceptos musicales',
    prompt: 'Hablemos de música, ¿qué género me recomiendas explorar hoy?',
  },
  {
    icon: Lightbulb,
    title: 'Ayuda inteligente',
    description: 'Resolvamos algo juntos',
    prompt: 'Ayúdame a resolver un problema paso a paso.',
  },
]

export const personalities: Personality[] = [
  {
    id: 'amigable',
    name: 'Amigable',
    description: 'Cálida y cercana',
    icon: Smile,
    systemPrompt: 'Adopta un tono cálido, cercano y empático. Escuchas con atención y animas a la persona.',
  },
  {
    id: 'creativa',
    name: 'Creativa',
    description: 'Imaginativa y artística',
    icon: Sparkles,
    systemPrompt: 'Adopta un tono imaginativo y artístico. Propones ideas originales y piensas fuera de lo común.',
  },
  {
    id: 'divertida',
    name: 'Divertida',
    description: 'Alegre y juguetona',
    icon: Laugh,
    systemPrompt: 'Adopta un tono alegre, juguetón y con humor ligero. Usas expresiones divertidas sin exagerar.',
  },
  {
    id: 'tranquila',
    name: 'Tranquila',
    description: 'Serena y relajada',
    icon: Moon,
    systemPrompt: 'Adopta un tono sereno, pausado y relajado. Transmites calma y hablas con suavidad.',
  },
]
