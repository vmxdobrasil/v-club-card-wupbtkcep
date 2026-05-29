import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, LayoutDashboard, ShoppingBag, CreditCard, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ role }: { role: string }) {
  const location = useLocation()
  const { signOut } = useAuth()

  const getLinks = () => {
    if (role === 'company') {
      return [
        { href: '/company', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/company/catalogos', label: 'Catálogos', icon: CreditCard },
        { href: '/company/ai-agent', label: 'AI Agent', icon: Bot },
      ]
    }
    if (role === 'partner') {
      return [
        { href: '/partner', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/partner/products', label: 'Produtos', icon: ShoppingBag },
        { href: '/partner/catalogos', label: 'Catálogos', icon: CreditCard },
      ]
    }
    if (role === 'holder') {
      return [{ href: '/holder', label: 'Dashboard', icon: LayoutDashboard }]
    }
    return []
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm z-20">
        <div className="p-6 border-b">
          <h2 className="text-xl font-black tracking-tight text-gray-800 capitalize">
            {role} Portal
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {getLinks().map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t bg-gray-50">
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 relative">
        <Outlet />
      </main>
    </div>
  )
}
