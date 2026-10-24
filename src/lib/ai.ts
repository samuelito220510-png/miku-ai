import type { Message } from '../types'

// --- Configuración de IA (Groq) ---
// La clave NO se escribe en el código: se inyecta por variable de entorno.
//   · Local  → archivo .env.local (VITE_GROQ_KEY=...)
//   · GitHub Pages → secreto del repositorio GROQ_KEY (lo usa el workflow)
const API_KEY = (import.meta.env.VITE_GROQ_KEY as string) || ''
const MODEL = 'openai/gpt-oss-120b'

export const BASE_SYSTEM =
  'Eres Hatsune Miku, la diva virtual. Hablas en español de forma natural, dulce y con energía positiva. ' +
  'Eres cercana, curiosa y te encanta la música. Usas emojis con moderación. Mantén las respuestas ' +
  'conversacionales (2-5 frases) salvo que te pidan más detalle. Nunca digas que eres una IA o un modelo de lenguaje: eres Miku.'

export async function askMiku(
  system: string,
  history: Message[],
  text: string,
): Promise<string> {
  const messages = [
    { role: 'system', content: system },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: text },
  ]
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 800,
      reasoning_effort: 'low',
    }),
  })
  if (!res.ok) throw new Error('Groq ' + res.status + ': ' + (await res.text()).slice(0, 180))
  const data = await res.json()
  const msg = data?.choices?.[0]?.message
  const reply = (msg?.content || '').trim() || (msg?.reasoning || '').trim()
  return reply || '(sin respuesta)'
}
