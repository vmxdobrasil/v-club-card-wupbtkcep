import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building,
  Package,
  BookOpen,
  Trash2,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function MasterLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const links = [
    { href: '/master', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/companies', label: 'Empresas', icon: Building },
    { href: '/partners', label: 'Parceiros', icon: Users },
    { href: '/usuarios', label: 'Portadores', icon: CreditCard },
    { href: '/products', label: 'Produtos', icon: Package },
    { href: '/catalogos', label: 'Catálogos', icon: BookOpen },
    { href: '/lixeira', label: 'Lixeira', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Master Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive =
              location.pathname === link.href || location.pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
