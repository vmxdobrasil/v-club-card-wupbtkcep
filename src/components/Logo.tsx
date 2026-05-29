import { cn } from '@/lib/utils'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg'

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-md',
        className,
      )}
    >
      <img
        src={cardImage}
        alt="V Club Card Logo"
        className="w-full h-full max-w-[140px] max-h-10 object-contain rounded"
      />
    </div>
  )
}
