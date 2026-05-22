import { CreditCard, History, QrCode, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const location = useLocation()

  const items = [
    { icon: Home, label: 'Início', path: '/holder' },
    { icon: History, label: 'Extrato', path: '/holder/history' },
    { icon: QrCode, label: 'Pagar', path: '/holder/pay' },
    { icon: CreditCard, label: 'Cartões', path: '/holder/cards' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-50 px-2 pb-safe">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground',
            location.pathname === item.path && 'text-primary',
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
