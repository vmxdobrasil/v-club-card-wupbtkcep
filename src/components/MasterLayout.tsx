import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Building,
  CreditCard,
  Users,
  Box,
  BookOpen,
  Trash2,
  LayoutDashboard,
} from 'lucide-react'

export function MasterLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/master', icon: LayoutDashboard },
    { name: 'Empresas', path: '/companies', icon: Building },
    { name: 'Parceiros', path: '/partners', icon: Users },
    { name: 'Produtos', path: '/products', icon: Box },
    { name: 'Catálogos', path: '/catalogos', icon: BookOpen },
    { name: 'Usuários', path: '/usuarios', icon: Users },
    { name: 'Lixeira', path: '/lixeira', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b flex flex-col items-center justify-center min-h-[80px]">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg"
            alt="V Club Card"
            className="h-12 object-contain"
          />
          <span className="text-xs font-semibold text-muted-foreground mt-2">Master Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
