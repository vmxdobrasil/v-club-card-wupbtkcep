import { cn } from '@/lib/utils'
import { Nfc } from 'lucide-react'

interface VirtualCardProps {
  company?: any
  cardNumber?: string
  holderName?: string
  expiry?: string
  className?: string
}

export function VirtualCard({ cardNumber, holderName, expiry, className }: VirtualCardProps) {
  const defaultNumber = '•••• •••• •••• ••••'
  const defaultName = 'CLIENTE V CLUB'
  const defaultExpiry = 'MM/AA'

  const displayCardNumber = cardNumber
    ? cardNumber.replace(/(\d{4})/g, '$1 ').trim()
    : defaultNumber

  const displayExpiry = expiry
    ? new Date(expiry).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
    : defaultExpiry

  return (
    <div
      className={cn(
        'relative w-full max-w-sm aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white p-5 flex flex-col justify-between border border-white/20',
        className,
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

      {/* Card Header (Logo + Contactless) */}
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-2">
          {/* Logo V CLUB */}
          <div className="flex bg-white rounded p-1 shadow-md">
            <div className="bg-[#1e3a8a] text-white px-2 py-0.5 rounded-l text-xl font-bold italic relative">
              V
              <div className="absolute -top-2 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
            </div>
            <div className="bg-red-600 text-white px-2 py-0.5 rounded-r text-xl font-bold">
              CLUB
            </div>
          </div>
        </div>
        <Nfc className="w-6 h-6 opacity-80" />
      </div>

      {/* Card Body (Chip & Number) */}
      <div className="z-10 space-y-4 mt-2">
        <div className="w-12 h-9 rounded bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center opacity-90 shadow-inner border border-slate-400">
          {/* Silver Chip */}
          <div className="w-full h-full border border-slate-500/50 rounded-[3px] opacity-70 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-500/50"></div>
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-slate-500/50"></div>
          </div>
        </div>

        <div
          className="font-mono text-2xl tracking-[0.15em] text-slate-100 drop-shadow-md font-bold"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.3)' }}
        >
          {displayCardNumber}
        </div>
      </div>

      {/* Card Footer (Name & Expiry) */}
      <div className="flex justify-between items-end z-10 mt-1">
        <div className="flex flex-col">
          <div className="font-cursive text-3xl text-white/90 drop-shadow-sm -mb-2 -ml-1">
            Faz mais por você!
          </div>
          <div
            className="font-semibold tracking-widest uppercase text-sm text-slate-100 drop-shadow-md truncate max-w-[200px]"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {holderName || defaultName}
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div className="uppercase text-[7px] leading-tight tracking-wider text-white/80 text-left">
            VALID
            <br />
            THRU
          </div>
          <div
            className="font-mono text-sm tracking-wider text-slate-100 drop-shadow-md font-bold"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {displayExpiry}
          </div>
        </div>
      </div>
    </div>
  )
}
