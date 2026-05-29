import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, LayoutDashboard, LogOut, FolderOpen, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  const getNavItems = () => {
    if (role === 'company') {
      return [
        { title: 'Dashboard', href: '/company', icon: LayoutDashboard },
        { title: 'Catálogos', href: '/company/catalogos', icon: FolderOpen },
        { title: 'AI Agent', href: '/company/ai-agent', icon: Bot },
      ]
    }
    if (role === 'partner') {
      return [
        { title: 'Dashboard', href: '/partner', icon: LayoutDashboard },
        { title: 'Produtos', href: '/partner/products', icon: Package },
        { title: 'Catálogos', href: '/partner/catalogos', icon: FolderOpen },
      ]
    }
    return [{ title: 'Dashboard', href: '/holder', icon: LayoutDashboard }]
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm z-10">
        <div className="p-6 border-b flex items-center justify-center bg-gray-900">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg"
            alt="Logo"
            className="h-12 w-auto object-contain rounded"
          />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <item.icon
                  className={cn('w-5 h-5 mr-3', isActive ? 'text-white' : 'text-gray-400')}
                />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair da Conta
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
