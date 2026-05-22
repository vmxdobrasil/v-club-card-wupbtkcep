import { NavLink } from 'react-router-dom'
import { CreditCard, QrCode, Store, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <NavLink
        to="/holder"
        end
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-semibold tracking-wider',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )
        }
      >
        <CreditCard className="h-5 w-5 mb-0.5" />
        <span>Início</span>
      </NavLink>
      <NavLink
        to="/holder/qr"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-semibold tracking-wider',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )
        }
      >
        <QrCode className="h-5 w-5 mb-0.5" />
        <span>Pagar</span>
      </NavLink>
      <NavLink
        to="/holder/partners"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-semibold tracking-wider',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )
        }
      >
        <Store className="h-5 w-5 mb-0.5" />
        <span>Parceiros</span>
      </NavLink>
      <NavLink
        to="/holder/profile"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-semibold tracking-wider',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )
        }
      >
        <User className="h-5 w-5 mb-0.5" />
        <span>Perfil</span>
      </NavLink>
    </nav>
  )
}
