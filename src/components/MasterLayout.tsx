import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Key, LayoutDashboard, Users, Building, LogOut, Package, BookOpen } from 'lucide-react'

export function MasterLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const menuItems = [
    { path: '/master', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/companies', icon: Building, label: 'Empresas' },
    { path: '/usuarios', icon: Users, label: 'Usuários' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/catalogos', icon: BookOpen, label: 'Catálogos' },
    { path: '/master/secrets', icon: Key, label: 'Integrações' },
  ]

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 bg-background border-r flex flex-col shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold tracking-tight text-primary">V Club Card</h2>
          <p className="text-sm text-muted-foreground mt-1">Administração Master</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/master' && location.pathname.startsWith(item.path))
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start font-medium"
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t bg-muted/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto relative">
        <div className="container mx-auto p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
