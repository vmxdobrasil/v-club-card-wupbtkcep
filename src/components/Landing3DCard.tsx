import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Nfc } from 'lucide-react'

interface Landing3DCardProps {
  variant: 'laranja' | 'azul' | 'preto'
  className?: string
}

export function Landing3DCard({ variant, className }: Landing3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -15
    const rotateY = ((x - centerX) / centerX) * 15

    setRotation({ x: rotateX, y: rotateY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.3,
    })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  const variants = {
    laranja: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      text: 'text-white',
      accent: 'text-blue-900',
      number: 'text-slate-100 drop-shadow-sm',
      slogan: 'Faz mais por você!',
      sloganClass: 'text-blue-900 opacity-90 text-sm absolute bottom-6 right-6',
    },
    azul: {
      bg: 'bg-gradient-to-br from-slate-800 to-blue-950',
      text: 'text-white',
      accent: 'text-red-500',
      number: 'text-slate-200 drop-shadow-sm',
      slogan: '',
      sloganClass: '',
    },
    preto: {
      bg: 'bg-gradient-to-br from-zinc-900 to-black',
      text: 'text-white',
      accent: 'text-amber-500',
      number: 'text-zinc-300 drop-shadow-md',
      slogan: '',
      sloganClass: '',
    },
  }

  const v = variants[variant]

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative w-full max-w-[340px] aspect-[1.586/1] cursor-pointer group mx-auto',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          'w-full h-full transition-transform duration-200 ease-out rounded-2xl shadow-2xl relative overflow-hidden',
          v.bg,
          v.text,
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
            opacity: glare.opacity,
            mixBlendMode: 'overlay',
          }}
        />

        <div
          className="absolute inset-0 p-6 flex flex-col justify-between z-10"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className={cn('font-bold italic text-xl tracking-tight', v.text)}>V CLUB</span>
              <span className={cn('font-bold text-sm tracking-widest', v.accent)}>CARD</span>
            </div>
            <Nfc className="w-6 h-6 opacity-80" />
          </div>

          <div className="mt-4">
            <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center overflow-hidden border border-yellow-600/50 shadow-inner">
              <div className="w-full h-[1px] bg-yellow-700/30 absolute"></div>
              <div className="w-[1px] h-full bg-yellow-700/30 absolute"></div>
              <div className="w-8 h-5 border border-yellow-700/30 rounded-sm"></div>
            </div>
          </div>

          <div className={cn('font-mono text-xl md:text-2xl tracking-[0.15em] mt-4', v.number)}>
            **** **** **** 1234
          </div>

          <div className="flex justify-between items-end text-sm mt-2 uppercase font-medium">
            <span className="truncate max-w-[70%] text-white/90">CLIENTE V CLUB</span>
            <div className="flex flex-col items-center">
              <span className="text-[8px] leading-tight text-white/70">
                VALID
                <br />
                THRU
              </span>
              <span className="text-white/90">12/29</span>
            </div>
          </div>

          {v.slogan && (
            <div className={v.sloganClass} style={{ fontFamily: 'cursive' }}>
              {v.slogan}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
