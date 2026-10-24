// Respeta el base de Vite (funciona en localhost y en GitHub Pages).
const MIKU_SRC = import.meta.env.BASE_URL + 'miku.png'

interface Props {
  size?: number
  variant?: 'circle' | 'bare'
  className?: string
  glow?: boolean
}

/**
 * Avatar de Hatsune Miku. `circle` recorta el rostro en un círculo con halo;
 * `bare` muestra la ilustración completa (para la pantalla de bienvenida).
 */
export function MikuAvatar({ size = 40, variant = 'circle', className = '', glow = true }: Props) {
  if (variant === 'bare') {
    return (
      <img
        src={MIKU_SRC}
        alt="Hatsune Miku"
        draggable={false}
        className={'select-none ' + className}
      />
    )
  }
  return (
    <div className={'relative shrink-0 ' + className} style={{ width: size, height: size }}>
      {glow && <span className="pointer-events-none absolute inset-0 rounded-full bg-miku/25 blur-md" />}
      <div className="relative h-full w-full overflow-hidden rounded-full bg-panel2 ring-1 ring-miku/40">
        <img
          src={MIKU_SRC}
          alt="Hatsune Miku"
          draggable={false}
          className="absolute left-1/2 max-w-none -translate-x-1/2 select-none"
          style={{ width: size * 2.05, top: size * 0.08 }}
        />
      </div>
    </div>
  )
}
