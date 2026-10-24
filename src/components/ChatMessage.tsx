import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AlertCircle, FileText } from 'lucide-react'
import { MikuAvatar } from './MikuAvatar'
import { MessageActions } from './MessageActions'
import type { Message } from '../types'

const markdownComponents = {
  p: (props: any) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props: any) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props: any) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  strong: (props: any) => <strong className="font-semibold text-soft" {...props} />,
  a: (props: any) => (
    <a className="text-miku underline underline-offset-2 hover:text-cyan" target="_blank" rel="noreferrer" {...props} />
  ),
  code: ({ inline, children, ...props }: any) =>
    inline ? (
      <code className="rounded bg-bg/70 px-1.5 py-0.5 font-mono text-[0.85em] text-miku" {...props}>
        {children}
      </code>
    ) : (
      <code className="font-mono text-[0.85em]" {...props}>
        {children}
      </code>
    ),
  pre: (props: any) => (
    <pre
      className="scroll-thin mb-2 overflow-x-auto rounded-xl border border-line/70 bg-bg/70 p-3 text-soft"
      {...props}
    />
  ),
}

export function ChatMessage({
  message,
  onRegenerate,
}: {
  message: Message
  onRegenerate?: () => void
}) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[76%] rounded-2xl rounded-br-md border border-line/70 bg-panel2/80 px-4 py-2.5 text-[15px] leading-relaxed text-soft">
          {message.fileName && (
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-bg/40 px-2 py-1 text-xs text-miku">
              <FileText size={13} /> {message.fileName}
            </div>
          )}
          {(message.display ?? message.content) && <div>{message.display ?? message.content}</div>}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-3"
    >
      <MikuAvatar size={34} className="mt-0.5" />
      <div className="min-w-0 max-w-[80%]">
        <span className="mb-1 block text-xs font-semibold text-miku">Miku</span>
        <div
          className={
            'rounded-2xl rounded-tl-md border px-4 py-3 text-[15px] leading-relaxed ' +
            (isError
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : 'border-line/60 bg-panel/70 text-soft')
          }
        >
          {isError ? (
            <span className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{message.content}</span>
            </span>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isError && <MessageActions content={message.content} onRegenerate={onRegenerate} />}
      </div>
    </motion.div>
  )
}
