import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

interface VirtualCardProps {
  company?: any
  cardNumber?: string
  holderName?: string
  expiry?: string
  className?: string
}

export function VirtualCard({
  company,
  cardNumber,
  holderName,
  expiry,
  className,
}: VirtualCardProps) {
  const logoUrl = company?.logo ? pb.files.getURL(company, company.logo) : null
  const defaultNumber = '••••  ••••  ••••  ••••'
  const defaultName = 'NOME DO USUÁRIO'
  const defaultExpiry = 'MM/AA'

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim()
  }

  const displayCardNumber = cardNumber ? formatCardNumber(cardNumber) : defaultNumber

  const displayExpiry = expiry
    ? new Date(expiry).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
    : defaultExpiry

  return (
    <div
      className={cn(
        'relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col justify-between border border-slate-700/50',
        className,
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header (Logo + Type) */}
      <div className="flex justify-between items-start z-10 relative">
        <div className="h-10 flex items-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo da Empresa"
              className="h-full max-w-[140px] object-contain drop-shadow-md"
            />
          ) : (
            <div className="text-xl font-bold tracking-tight text-white/90">
              {company?.name || 'V Club Card'}
            </div>
          )}
        </div>
        <svg
          className="w-10 h-10 opacity-80"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
            fill="url(#paint0_linear)"
          />
          <path
            d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
            fill="url(#paint1_linear)"
            fillOpacity="0.5"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="14"
              y1="0"
              x2="34"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF" stopOpacity="0.3" />
              <stop offset="1" stopColor="#FFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear"
              x1="0"
              y1="24"
              x2="48"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF" stopOpacity="0" />
              <stop offset="1" stopColor="#FFF" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card Body (Chip & Number) */}
      <div className="z-10 space-y-5 mt-4">
        <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center opacity-90 shadow-sm border border-yellow-600/30">
          <div className="w-full h-full border border-yellow-700/20 rounded-[3px] opacity-50 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-700/20"></div>
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-yellow-700/20"></div>
          </div>
        </div>

        <div className="font-mono text-2xl md:text-[1.65rem] tracking-[0.15em] text-white/95 drop-shadow-sm font-medium">
          {displayCardNumber}
        </div>
      </div>

      {/* Card Footer (Name & Expiry) */}
      <div className="flex justify-between items-end z-10 mt-2">
        <div className="font-semibold tracking-widest uppercase text-sm text-white/90 truncate max-w-[70%]">
          {holderName || defaultName}
        </div>
        <div className="text-right">
          <div className="uppercase text-[9px] tracking-wider text-white/60 mb-[2px]">Validade</div>
          <div className="font-mono text-sm tracking-wider text-white/90">{displayExpiry}</div>
        </div>
      </div>
    </div>
  )
}
