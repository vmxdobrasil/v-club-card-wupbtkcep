import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Building2, Trash2, Users, ShoppingBag, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function MasterLayout() {
  const location = useLocation()
  const { signOut } = useAuth()

  const navItems = [
    { name: 'Dashboard', path: '/master', icon: LayoutDashboard },
    { name: 'Empresas', path: '/companies', icon: Building2 },
    { name: 'Parceiros', path: '/partners', icon: Users },
    { name: 'Produtos', path: '/products', icon: ShoppingBag },
    { name: 'Catálogos', path: '/catalogos', icon: BookOpen },
    { name: 'Usuários', path: '/usuarios', icon: Users },
    { name: 'Lixeira', path: '/lixeira', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="h-16 flex items-center justify-center border-b px-4 shrink-0">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg"
            alt="V Club Card Logo"
            className="max-h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.nextSibling) {
                ;(e.currentTarget.nextSibling as HTMLElement).style.display = 'block'
              }
            }}
          />
          <span className="font-bold text-xl hidden text-primary">V Club Card</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname.startsWith(item.path) &&
              (item.path !== '/master' || location.pathname === '/master')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t shrink-0">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <Outlet />
      </main>
    </div>
  )
}
