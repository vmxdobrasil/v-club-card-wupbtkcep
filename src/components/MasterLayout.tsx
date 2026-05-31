import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building,
  Users,
  BriefcaseBusiness,
  Box,
  Layers,
  Trash2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/master', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/companies', icon: Building, label: 'Empresas' },
  { href: '/bin', icon: Trash2, label: 'BINs' },
  { href: '/partners', icon: BriefcaseBusiness, label: 'Parceiros' },
  { href: '/products', icon: Box, label: 'Produtos' },
  { href: '/catalogos', icon: Layers, label: 'Catálogos' },
  { href: '/usuarios', icon: Users, label: 'Portadores' },
  { href: '/lixeira', icon: Trash2, label: 'Lixeira' },
]

export function MasterLayout() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tight">V Club Master</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 h-full relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
