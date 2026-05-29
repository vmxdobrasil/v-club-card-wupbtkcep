import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-md bg-white',
        className,
      )}
    >
      <img
        src="https://img.usecurling.com/i?q=credit%20card&color=gradient&shape=fill"
        alt="V Club Card Logo"
        className="w-full h-full max-w-[140px] max-h-10 object-contain"
      />
    </div>
  )
}
