import { Home, QrCode, CreditCard, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const location = useLocation()

  const navItems = [
    { title: 'Início', url: '/holder', icon: Home },
    { title: 'Pagar', url: '#pay', icon: QrCode, featured: true },
    { title: 'Cartões', url: '#cards', icon: CreditCard },
    { title: 'Perfil', url: '#profile', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-lg border-t flex items-center justify-around px-2 z-50 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.url || location.hash === item.url
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              'flex flex-col items-center justify-center w-16 h-full transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
              item.featured && '-mt-6 relative',
            )}
          >
            {item.featured ? (
              <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg mb-1 ring-4 ring-background">
                <item.icon className="w-6 h-6" />
              </div>
            ) : (
              <>
                <item.icon
                  className={cn('w-5 h-5 mb-1 transition-transform', isActive && 'scale-110')}
                />
                <span className="text-[10px] font-medium">{item.title}</span>
              </>
            )}
          </Link>
        )
      })}
    </div>
  )
}
