import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Wifi } from 'lucide-react'

interface LandingCardProps {
  variant?: 'orange' | 'blue' | 'black'
  className?: string
}

export function LandingCard({ variant = 'orange', className }: LandingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

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
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
  }

  const variants = {
    orange: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 text-white',
    blue: 'bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white',
    black:
      'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-200 border border-gray-700',
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative w-full max-w-sm aspect-[1.586/1] rounded-2xl cursor-pointer perspective-1000 mx-auto group',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className={cn(
          'absolute inset-0 w-full h-full rounded-2xl shadow-2xl transition-transform duration-200 ease-out p-6 flex flex-col justify-between overflow-hidden border',
          variant === 'orange'
            ? 'border-orange-300/30'
            : variant === 'blue'
              ? 'border-blue-400/20'
              : 'border-gray-600',
          variants[variant],
        )}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-overlay pointer-events-none" />

        <div className="flex justify-between items-start z-10">
          <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md flex items-center justify-center border border-yellow-600/50 shadow-inner">
            <div className="w-full h-full opacity-30 border-[0.5px] border-black/50 rounded-sm overflow-hidden flex flex-col justify-between p-1">
              <div className="w-full border-b border-black/50" />
              <div className="w-full border-b border-black/50" />
            </div>
          </div>
          <Wifi className="w-6 h-6 rotate-90 opacity-80" />
        </div>

        <div className="z-10 mt-auto space-y-4">
          {variant === 'orange' && (
            <div
              className="absolute top-6 right-6 text-2xl opacity-90 -rotate-3 tracking-wider drop-shadow-md"
              style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}
            >
              Faz mais por você!
            </div>
          )}
          {variant === 'blue' && (
            <div className="absolute top-6 right-6 font-bold text-red-400 opacity-90 text-sm tracking-widest drop-shadow">
              PRIVATE LABEL
            </div>
          )}
          {variant === 'black' && (
            <div className="absolute top-6 right-6 font-bold text-yellow-500 opacity-90 text-sm tracking-widest drop-shadow">
              PREMIUM
            </div>
          )}

          <div className="font-mono text-xl md:text-2xl tracking-[0.15em] drop-shadow-md text-white/90">
            **** **** **** 1234
          </div>
          <div className="flex justify-between items-end text-xs uppercase opacity-90 font-medium">
            <span>CLIENTE V CLUB</span>
            <div className="flex flex-col items-center">
              <span className="text-[8px] leading-none mb-1">VALID THRU</span>
              <span>12/29</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
