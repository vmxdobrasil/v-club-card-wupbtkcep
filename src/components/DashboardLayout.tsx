import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, BookOpen, Bot, Box } from 'lucide-react'

export function DashboardLayout({ role }: { role: 'company' | 'holder' | 'partner' }) {
  const { signOut } = useAuth()
  const location = useLocation()

  const getNavItems = () => {
    switch (role) {
      case 'company':
        return [
          { name: 'Dashboard', path: '/company', icon: LayoutDashboard },
          { name: 'Catálogos', path: '/company/catalogos', icon: BookOpen },
          { name: 'AI Agent', path: '/company/ai-agent', icon: Bot },
        ]
      case 'partner':
        return [
          { name: 'Dashboard', path: '/partner', icon: LayoutDashboard },
          { name: 'Produtos', path: '/partner/products', icon: Box },
          { name: 'Catálogos', path: '/partner/catalogos', icon: BookOpen },
        ]
      case 'holder':
        return [{ name: 'Dashboard', path: '/holder', icon: LayoutDashboard }]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b flex flex-col items-center justify-center min-h-[80px]">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg"
            alt="V Club Card"
            className="h-12 object-contain"
          />
          <span className="text-xs font-semibold text-muted-foreground mt-2 capitalize">
            {role}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path + '/') && item.path !== `/${role}`)
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
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
