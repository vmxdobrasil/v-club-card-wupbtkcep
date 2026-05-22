import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Nfc } from 'lucide-react'

interface CreditCardProps {
  name: string
  number: string
  expiry: string
  cvv: string
  brandName?: string
  isVirtual?: boolean
  colorClass?: string
}

export function CreditCard({
  name,
  number,
  expiry,
  cvv,
  brandName = 'V Club',
  isVirtual = false,
  colorClass = 'from-primary to-slate-900',
}: CreditCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative w-full max-w-sm aspect-[1.586/1] perspective-1000 cursor-pointer group mx-auto"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={cn(
          'w-full h-full transition-transform duration-700 transform-style-3d',
          flipped && 'rotate-y-180',
        )}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden bg-gradient-to-br rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden',
            colorClass,
          )}
        >
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            <div>
              <span className="font-bold italic text-2xl tracking-tight">{brandName}</span>
              {isVirtual && (
                <div className="text-[10px] uppercase tracking-widest opacity-80 mt-1">
                  Virtual Card
                </div>
              )}
            </div>
            <Nfc className="w-6 h-6 opacity-90" />
          </div>

          <div className="z-10 space-y-4">
            <div className="font-mono text-xl md:text-2xl tracking-[0.15em] drop-shadow-md">
              {number}
            </div>
            <div className="flex justify-between items-end text-sm uppercase opacity-90 font-medium">
              <span className="truncate max-w-[70%]">{name}</span>
              <span>{expiry}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-800 rounded-2xl flex flex-col text-white shadow-2xl overflow-hidden border border-slate-700">
          <div className="w-full h-12 bg-black/80 mt-6" />
          <div className="px-6 py-4 flex flex-col items-end gap-2 flex-1">
            <div className="w-full bg-white text-black px-4 py-2 font-mono text-sm rounded flex justify-end items-center relative">
              <div
                className="absolute left-0 inset-y-0 w-3/4 bg-slate-200"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                }}
              ></div>
              <span className="relative z-10 italic">{cvv}</span>
            </div>
            <div className="text-[10px] text-slate-400 max-w-[80%] text-right mt-auto">
              Este cartão é pessoal e intransferível. Em caso de perda, contate o suporte V Club.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
