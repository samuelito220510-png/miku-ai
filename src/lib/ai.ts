import type { Message } from '../types'

// --- Configuración de IA integrada en el código ---
// (OpenRouter, modelo gratis). Para uso personal; no publiques la clave.
const API_KEY = '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'
const MODEL = 'openrouter/free'

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
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + API_KEY,
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'http://localhost',
      'X-Title': 'MIKU AI',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.9, max_tokens: 1500 }),
  })
  if (!res.ok) throw new Error('OpenRouter ' + res.status + ': ' + (await res.text()).slice(0, 180))
  const data = await res.json()
  const msg = data?.choices?.[0]?.message
  const reply = (msg?.content || '').trim() || (msg?.reasoning || '').trim()
  return reply || '(sin respuesta)'
}
