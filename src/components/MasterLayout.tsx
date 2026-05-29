import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Building,
  Users,
  Box,
  ShoppingCart,
  Trash2,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MasterLayout() {
  const location = useLocation()

  const navItems = [
    { href: '/master', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/companies', icon: Building, label: 'Empresas' },
    { href: '/partners', icon: ShoppingCart, label: 'Empresas Parceiras' },
    { href: '/products', icon: Box, label: 'Produtos' },
    { href: '/catalogos', icon: CreditCard, label: 'Catálogos' },
    { href: '/usuarios', icon: Users, label: 'Usuários' },
    { href: '/lixeira', icon: Trash2, label: 'Lixeira' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 font-bold text-white text-2xl border-b border-slate-800 tracking-tighter flex items-center gap-2">
          V CLUB
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-4 py-3 flex items-center gap-3 rounded-md transition-colors font-medium',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between shrink-0 shadow-sm">
          <h1 className="font-semibold text-slate-800">Painel de Administração</h1>
        </header>
        <div className="p-8 overflow-auto flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
