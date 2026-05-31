import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { LayoutDashboard, BookOpen, LogOut, Package } from 'lucide-react'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navByRole = {
    company: [
      { name: 'Dashboard', href: '/company', icon: LayoutDashboard },
      { name: 'Catálogos', href: '/company/catalogos', icon: BookOpen },
    ],
    holder: [{ name: 'Dashboard', href: '/holder', icon: LayoutDashboard }],
    partner: [
      { name: 'Dashboard', href: '/partner', icon: LayoutDashboard },
      { name: 'Produtos', href: '/partner/products', icon: Package },
      { name: 'Catálogos', href: '/partner/catalogos', icon: BookOpen },
    ],
  }

  const navigation = navByRole[role] || []

  return (
    <div className="flex min-h-screen bg-muted/10">
      <aside className="w-64 border-r bg-background flex flex-col fixed inset-y-0">
        <div className="flex h-14 items-center gap-2 border-b px-6 font-semibold text-primary capitalize">
          <span>{role} Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (location.pathname.startsWith(item.href) && item.href !== `/${role}`)
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary uppercase">
              {user?.name?.charAt(0) || role.charAt(0)}
            </div>
            <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-medium truncate">{user?.name || role}</span>
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
