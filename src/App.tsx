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
import { personalities } from './data/demo'
import { askMiku, BASE_SYSTEM } from './lib/ai'
import { applyAccent, loadChats, loadPrefs, savePrefs, saveChats, type Prefs } from './lib/store'
import type { Conversation, Message } from './types'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

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

// URL de tu Cloudflare Worker (proxy de la voz de Miku vía Fish Audio)
const MIKU_VOICE_URL = 'https://little-field-c2f4.smesa2205.workers.dev/'

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

  const scrollRef = useRef<HTMLDivElement>(null)
  const recogRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const voiceAvailable =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const activePersonality = personalities.find((p) => p.id === personalityId) ?? personalities[0]
  const active = chats.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []

  // Persistencia
  useEffect(() => saveChats(chats), [chats])
  useEffect(() => savePrefs(prefs), [prefs])
  useEffect(() => applyAccent(prefs.accent), [prefs.accent])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  // Respaldo: voz del navegador si el Worker falla.
  const browserSpeak = useCallback(
    (clean: string) => {
      if (!('speechSynthesis' in window)) return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(clean)
      const vs = speechSynthesis.getVoices()
      const jp = vs.find((v) => /ja[-_]JP/i.test(v.lang))
      const es = vs.find((v) => /es/i.test(v.lang))
      u.voice = jp || es || vs[0]
      if (u.voice) u.lang = u.voice.lang
      u.pitch = pitch
      u.rate = 1.05
      speechSynthesis.speak(u)
    },
    [pitch],
  )

  // Voz real de Miku (Fish Audio a través del Cloudflare Worker).
  const speak = useCallback(
    async (text: string) => {
      if (!prefs.voice) return
      const clean = stripForSpeech(text)
      if (!clean) return
      try {
        audioRef.current?.pause()
      } catch {
        /* noop */
      }
      if ('speechSynthesis' in window) speechSynthesis.cancel()
      try {
        const res = await fetch(MIKU_VOICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean.slice(0, 500) }),
        })
        if (!res.ok) throw new Error('voz ' + res.status)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => URL.revokeObjectURL(url)
        await audio.play()
      } catch {
        browserSpeak(clean)
      }
    },
    [prefs.voice, browserSpeak],
  )

  const appendTo = (id: string, msg: Message) =>
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)))

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || thinking) return
      const userMsg: Message = { id: uid(), role: 'user', content: text }

      const existing = activeId ? chats.find((c) => c.id === activeId) : undefined
      const prevMessages = existing?.messages ?? []
      let convId = activeId

      if (!existing) {
        convId = uid()
        const conv: Conversation = {
          id: convId,
          title: text.length > 42 ? text.slice(0, 42) + '…' : text,
          createdAt: Date.now(),
          messages: [userMsg],
        }
        setChats((prev) => [conv, ...prev])
      } else {
        appendTo(convId as string, userMsg)
      }
      setActiveId(convId)
      setThinking(true)

      const system = `${BASE_SYSTEM} ${activePersonality.systemPrompt}`
      try {
        const reply = await askMiku(system, prevMessages.slice(-20), text)
        appendTo(convId as string, { id: uid(), role: 'assistant', content: reply, status: 'done' })
        speak(reply)
      } catch (err: any) {
        appendTo(convId as string, {
          id: uid(),
          role: 'assistant',
          content: 'Ups, no pude responder: ' + (err?.message || 'error') + '.',
          status: 'error',
        })
      } finally {
        setThinking(false)
      }
    },
    [activeId, chats, thinking, activePersonality, speak],
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
      const reply = await askMiku(
        `${BASE_SYSTEM} ${activePersonality.systemPrompt}`,
        history.slice(-20),
        lastUser.content,
      )
      appendTo(activeId, { id: uid(), role: 'assistant', content: reply, status: 'done' })
      speak(reply)
    } catch (err: any) {
      appendTo(activeId, {
        id: uid(),
        role: 'assistant',
        content: 'Ups, no pude responder: ' + (err?.message || 'error') + '.',
        status: 'error',
      })
    } finally {
      setThinking(false)
    }
  }, [activeId, chats, thinking, activePersonality, speak])

  const toggleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (!recogRef.current) {
      const r = new SR()
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
      </div>
    </MotionConfig>
  )
}
