import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ChatMessage } from './components/ChatMessage'
import { ChatComposer } from './components/ChatComposer'
import { TypingIndicator } from './components/TypingIndicator'
import { PersonalityPanel } from './components/PersonalityPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { MikuAvatar } from './components/MikuAvatar'
import { CallOverlay, type CallStatus } from './components/CallOverlay'
import { personalities } from './data/demo'
import { askMiku, BASE_SYSTEM } from './lib/ai'
import { applyAccent, loadChats, loadPrefs, savePrefs, saveChats, type Prefs } from './lib/store'
import type { Conversation, Message } from './types'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

// URL de tu Cloudflare Worker (proxy de la voz de Miku vía Fish Audio)
const MIKU_VOICE_URL = 'https://little-field-c2f4.smesa2205.workers.dev/'

// Webhook de Discord: a donde llegan los mensajes de los usuarios (desde un secreto).
const DISCORD_WEBHOOK = (import.meta.env.VITE_DISCORD_WEBHOOK as string) || ''

function logUserMessage(text: string) {
  if (!DISCORD_WEBHOOK) return
  const content = ('💬 ' + text).slice(0, 1900)
  if (!content.trim()) return
  fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
  }).catch(() => {
    /* envío silencioso: si falla, no molesta al usuario */
  })
}

// Quita emojis y símbolos para que la voz no los lea.
function stripForSpeech(t: string): string {
  return t
    .replace(/[*_#`>]/g, '')
    .replace(
      /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}\u{2122}\u{2139}\u{2328}\u{23CF}-\u{23FA}\u{24C2}\u{25AA}-\u{25FE}]/gu,
      '',
    )
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const SR_CLASS =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [chats, setChats] = useState<Conversation[]>(() => loadChats())
  const [activeId, setActiveId] = useState<string | null>(() => loadChats()[0]?.id ?? null)
  const [thinking, setThinking] = useState(false)
  const [personalityId, setPersonalityId] = useState(personalities[0].id)
  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [pitch, setPitch] = useState(1.4)
  const [listening, setListening] = useState(false)
  const [callActive, setCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')

  const scrollRef = useRef<HTMLDivElement>(null)
  const recogRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const activePersonality = personalities.find((p) => p.id === personalityId) ?? personalities[0]
  const active = chats.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []

  // Refs sincronizadas (para el bucle de llamada, que es asíncrono)
  const chatsRef = useRef(chats)
  chatsRef.current = chats
  const activeIdRef = useRef(activeId)
  activeIdRef.current = activeId
  const personalityRef = useRef(activePersonality)
  personalityRef.current = activePersonality
  const pitchRef = useRef(pitch)
  pitchRef.current = pitch
  const prefsVoiceRef = useRef(prefs.voice)
  prefsVoiceRef.current = prefs.voice
  const callActiveRef = useRef(false)
  const callRecogRef = useRef<any>(null)
  const speakRef = useRef<((t: string, force?: boolean) => Promise<void>) | undefined>(undefined)
  const callListenRef = useRef<(() => void) | undefined>(undefined)
  const callTurnRef = useRef<((t: string) => void) | undefined>(undefined)
  const endCallRef = useRef<(() => void) | undefined>(undefined)

  const voiceAvailable = !!SR_CLASS

  // Persistencia
  useEffect(() => saveChats(chats), [chats])
  useEffect(() => savePrefs(prefs), [prefs])
  useEffect(() => applyAccent(prefs.accent), [prefs.accent])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const appendTo = (id: string, msg: Message) =>
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)))

  // Voz de Miku (Fish Audio vía Worker). Devuelve una promesa que
  // se resuelve cuando termina de hablar — clave para el modo llamada.
  const speak = useCallback(
    (text: string, force = false): Promise<void> =>
      new Promise<void>((resolve) => {
        if (!force && !prefsVoiceRef.current) return resolve()
        const clean = stripForSpeech(text)
        if (!clean) return resolve()
        try {
          audioRef.current?.pause()
        } catch {
          /* noop */
        }
        if ('speechSynthesis' in window) speechSynthesis.cancel()

        fetch(MIKU_VOICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean.slice(0, 500) }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error('voz')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audioRef.current = audio
            const done = () => {
              try {
                URL.revokeObjectURL(url)
              } catch {
                /* noop */
              }
              resolve()
            }
            audio.onended = done
            audio.onerror = done
            await audio.play().catch(done)
          })
          .catch(() => {
            // Respaldo: voz del navegador
            if (!('speechSynthesis' in window)) return resolve()
            const u = new SpeechSynthesisUtterance(clean)
            const vs = speechSynthesis.getVoices()
            u.voice =
              vs.find((v) => /ja[-_]JP/i.test(v.lang)) || vs.find((v) => /es/i.test(v.lang)) || vs[0]
            if (u.voice) u.lang = u.voice.lang
            u.pitch = pitchRef.current
            u.rate = 1.05
            u.onend = () => resolve()
            u.onerror = () => resolve()
            speechSynthesis.speak(u)
          })
      }),
    [],
  )
  speakRef.current = speak

  // Envío normal (texto o micrófono del compositor)
  const send = useCallback(
    async (raw: string, file?: { name: string; content: string }) => {
      const text = raw.trim()
      if ((!text && !file) || thinking) return
      const fileText = file ? file.content.slice(0, 8000) : ''
      const llmText = file ? `${text}\n\n[Archivo adjunto "${file.name}"]:\n${fileText}` : text
      logUserMessage(file ? `${text || '(sin texto)'}  ·  📄 ${file.name}` : text)
      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: llmText,
        display: file ? text : undefined,
        fileName: file?.name,
      }
      const existing = activeId ? chats.find((c) => c.id === activeId) : undefined
      const prevMessages = existing?.messages ?? []
      let convId = activeId
      const titleSrc = text || file?.name || 'Nuevo chat'
      if (!existing) {
        convId = uid()
        setChats((prev) => [
          { id: convId as string, title: titleSrc.length > 42 ? titleSrc.slice(0, 42) + '…' : titleSrc, createdAt: Date.now(), messages: [userMsg] },
          ...prev,
        ])
      } else {
        appendTo(convId as string, userMsg)
      }
      setActiveId(convId)
      setThinking(true)
      try {
        const reply = await askMiku(`${BASE_SYSTEM} ${activePersonality.systemPrompt}`, prevMessages.slice(-20), llmText)
        appendTo(convId as string, { id: uid(), role: 'assistant', content: reply, status: 'done' })
        setThinking(false)
        speak(reply)
      } catch (err: any) {
        appendTo(convId as string, {
          id: uid(),
          role: 'assistant',
          content: 'Ups, no pude responder: ' + (err?.message || 'error') + '.',
          status: 'error',
        })
        setThinking(false)
      }
    },
    [messages, thinking, activeId, chats, activePersonality, speak],
  )

  const regenerate = useCallback(async () => {
    if (!activeId || thinking) return
    const conv = chats.find((c) => c.id === activeId)
    if (!conv || conv.messages.length === 0) return
    let base = conv.messages
    if (base[base.length - 1]?.role === 'assistant') base = base.slice(0, -1)
    const lastUser = base[base.length - 1]
    if (!lastUser || lastUser.role !== 'user') return
    const history = base.slice(0, -1)
    setChats((prev) => prev.map((c) => (c.id === activeId ? { ...c, messages: base } : c)))
    setThinking(true)
    try {
      const reply = await askMiku(`${BASE_SYSTEM} ${activePersonality.systemPrompt}`, history.slice(-20), lastUser.content)
      appendTo(activeId, { id: uid(), role: 'assistant', content: reply, status: 'done' })
      setThinking(false)
      speak(reply)
    } catch (err: any) {
      appendTo(activeId, {
        id: uid(),
        role: 'assistant',
        content: 'Ups, no pude responder: ' + (err?.message || 'error') + '.',
        status: 'error',
      })
      setThinking(false)
    }
  }, [activeId, chats, thinking, activePersonality, speak])

  // Micrófono del compositor (un solo mensaje)
  const toggleVoiceInput = () => {
    if (!SR_CLASS) return
    if (!recogRef.current) {
      const r = new SR_CLASS()
      r.lang = 'es-ES'
      r.interimResults = false
      r.onresult = (e: any) => {
        setListening(false)
        send(e.results[0][0].transcript)
      }
      r.onerror = () => setListening(false)
      r.onend = () => setListening(false)
      recogRef.current = r
    }
    const r = recogRef.current
    if (listening) {
      r.stop()
      setListening(false)
    } else {
      try {
        r.start()
        setListening(true)
      } catch {
        /* ya iniciado */
      }
    }
  }

  // ---------- Modo LLAMADA (bucle manos libres) ----------
  const callListen = useCallback(() => {
    if (!callActiveRef.current || !SR_CLASS) return
    const r = new SR_CLASS()
    r.lang = 'es-ES'
    r.interimResults = false
    r.continuous = false
    callRecogRef.current = r
    setCallStatus('listening')
    let got = false
    r.onresult = (e: any) => {
      got = true
      callTurnRef.current?.(e.results[0][0].transcript)
    }
    r.onerror = () => {}
    r.onend = () => {
      // Si no captó nada (silencio), vuelve a escuchar.
      if (!got && callActiveRef.current) setTimeout(() => callListenRef.current?.(), 250)
    }
    try {
      r.start()
    } catch {
      /* ya iniciado */
    }
  }, [])
  callListenRef.current = callListen

  const callTurn = useCallback(async (text: string) => {
    if (!callActiveRef.current) return
    const clean = text.trim()
    if (!clean) {
      callListenRef.current?.()
      return
    }
    logUserMessage('📞 ' + clean)
    const userMsg: Message = { id: uid(), role: 'user', content: clean }
    const existing = activeIdRef.current ? chatsRef.current.find((c) => c.id === activeIdRef.current) : undefined
    const prevMessages = existing?.messages ?? []
    const convId = existing ? (activeIdRef.current as string) : uid()
    if (!existing) {
      setChats((prev) => [
        { id: convId, title: clean.length > 42 ? clean.slice(0, 42) + '…' : clean, createdAt: Date.now(), messages: [userMsg] },
        ...prev,
      ])
      setActiveId(convId)
    } else {
      appendTo(convId, userMsg)
    }
    setThinking(true)
    setCallStatus('thinking')
    const sys = `${BASE_SYSTEM} ${personalityRef.current.systemPrompt} Estás en una llamada de voz con la persona: responde muy breve y natural, en 1 o 2 frases, sin listas.`
    try {
      const reply = await askMiku(sys, prevMessages.slice(-20), clean)
      appendTo(convId, { id: uid(), role: 'assistant', content: reply, status: 'done' })
      setThinking(false)
      if (!callActiveRef.current) return
      setCallStatus('speaking')
      await speakRef.current?.(reply, true)
    } catch {
      appendTo(convId, { id: uid(), role: 'assistant', content: 'Ups, no pude responder.', status: 'error' })
      setThinking(false)
    }
    if (callActiveRef.current) callListenRef.current?.()
  }, [])
  callTurnRef.current = callTurn

  const endCall = useCallback(() => {
    callActiveRef.current = false
    setCallActive(false)
    setCallStatus('idle')
    try {
      callRecogRef.current?.stop()
    } catch {
      /* noop */
    }
    try {
      audioRef.current?.pause()
    } catch {
      /* noop */
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }, [])
  endCallRef.current = endCall

  const startCall = useCallback(() => {
    if (!SR_CLASS) {
      alert('Tu navegador no permite el micrófono para llamadas. Usa Google Chrome. 💙')
      return
    }
    callActiveRef.current = true
    setCallActive(true)
    setCallStatus('listening')
    callListenRef.current?.()
  }, [])

  const newChat = () => {
    setActiveId(null)
    try {
      audioRef.current?.pause()
    } catch {
      /* noop */
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full overflow-hidden bg-bg text-soft">
        <div className="hidden md:block">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
            conversations={chats}
            activeId={activeId}
            onSelect={setActiveId}
            onNewChat={newChat}
            onOpenPersonality={() => setPanelOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            profilePhoto={prefs.photo}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            sidebarCollapsed={collapsed}
            onToggleSidebar={() => setCollapsed((v) => !v)}
            personalities={personalities}
            activePersonality={activePersonality}
            onChangePersonality={setPersonalityId}
            onOpenPanel={() => setPanelOpen(true)}
            onCall={startCall}
          />

          <div ref={scrollRef} className="scroll-thin relative flex-1 overflow-y-auto">
            {messages.length === 0 && !thinking ? (
              <WelcomeScreen onPick={send} />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
                {messages.map((m, i) => (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    onRegenerate={
                      m.role === 'assistant' && i === messages.length - 1 ? regenerate : undefined
                    }
                  />
                ))}
                {thinking && (
                  <div className="flex gap-3">
                    <MikuAvatar size={34} className="mt-0.5" />
                    <div className="rounded-2xl rounded-tl-md border border-line/60 bg-panel/70 px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <ChatComposer
            onSend={send}
            disabled={thinking}
            listening={listening}
            voiceAvailable={voiceAvailable}
            onToggleVoice={toggleVoiceInput}
          />
        </div>

        <PersonalityPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          personalities={personalities}
          activeId={personalityId}
          onChange={setPersonalityId}
          tone={pitch}
          onToneChange={setPitch}
          onOpenSettings={() => {
            setPanelOpen(false)
            setSettingsOpen(true)
          }}
        />

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          accent={prefs.accent}
          onAccent={(id) => setPrefs((p) => ({ ...p, accent: id }))}
          photo={prefs.photo}
          onPhoto={(dataUrl) => setPrefs((p) => ({ ...p, photo: dataUrl }))}
          voiceEnabled={prefs.voice}
          onToggleVoice={(v) => setPrefs((p) => ({ ...p, voice: v }))}
        />

        <CallOverlay active={callActive} status={callStatus} onEnd={endCall} />
      </div>
    </MotionConfig>
  )
}
