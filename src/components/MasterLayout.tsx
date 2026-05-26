import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Store, Building, BookOpen, Package, Users, LogOut } from 'lucide-react'

export function MasterLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const nav = [
    { name: 'Dashboard', path: '/master', icon: Store },
    { name: 'Companies', path: '/master/companies', icon: Building },
    { name: 'Products', path: '/master/products', icon: Package },
    { name: 'Catalogs', path: '/master/catalogs', icon: BookOpen },
    { name: 'Partners', path: '/master/partners', icon: Users },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-5 border-b font-bold text-xl text-primary">V Club Master</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted text-gray-700',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={signOut}
            className="flex items-center gap-3 text-red-600 w-full px-3 py-2 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  )
}
