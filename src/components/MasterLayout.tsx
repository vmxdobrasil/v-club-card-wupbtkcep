import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Trash2,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Store,
  Box,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function MasterLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const navItems = [
    { name: 'Dashboard', path: '/master', icon: LayoutDashboard },
    { name: 'Empresas', path: '/companies', icon: Building2 },
    { name: 'Parceiros', path: '/partners', icon: Store },
    { name: 'Catálogos', path: '/catalogos', icon: Box },
    { name: 'Usuários', path: '/usuarios', icon: Users },
    { name: 'Lixeira', path: '/lixeira', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <CreditCard className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">V Club Master</span>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Master Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
