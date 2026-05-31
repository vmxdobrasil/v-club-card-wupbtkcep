import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  BookOpen,
  Trash2,
  Key,
  Users2,
  LogOut,
  Shield,
} from 'lucide-react'

export function MasterLayout() {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/master', icon: LayoutDashboard },
    { name: 'Empresas', href: '/companies', icon: Building2 },
    { name: 'Parceiros', href: '/partners', icon: Users2 },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Catálogos', href: '/catalogos', icon: BookOpen },
    { name: 'Usuários', href: '/usuarios', icon: Users },
    { name: 'Segredos', href: '/master/secrets', icon: Key },
    { name: 'Lixeira', href: '/lixeira', icon: Trash2 },
  ]

  return (
    <div className="flex min-h-screen bg-muted/10">
      <aside className="w-64 border-r bg-background flex flex-col fixed inset-y-0">
        <div className="flex h-14 items-center gap-2 border-b px-6 font-semibold text-primary">
          <Shield className="h-5 w-5" />
          <span>Master Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (location.pathname.startsWith(item.href) && item.href !== '/master')
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-medium truncate">{user?.name || 'Master Admin'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </button>
        </div>
      </aside>
      <main className="flex-1 pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
