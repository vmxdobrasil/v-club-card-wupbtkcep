import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, LayoutDashboard, List, Box, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardLayout({ role }: { role: 'company' | 'holder' | 'partner' }) {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando...</div>
    )
  if (!user || user.role !== role) return <Navigate to="/" />

  const navItems = {
    company: [
      { path: '/company', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/company/catalogos', label: 'Catálogos', icon: List },
      { path: '/company/ai-agent', label: 'AI Agent', icon: User },
    ],
    partner: [
      { path: '/partner', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/partner/products', label: 'Produtos', icon: Box },
      { path: '/partner/catalogos', label: 'Catálogos', icon: List },
    ],
    holder: [{ path: '/holder', label: 'Dashboard', icon: LayoutDashboard }],
  }[role]

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">V Club Card</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
            {role} Panel
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium',
                location.pathname === item.path
                  ? 'bg-slate-800 text-white'
                  : 'hover:bg-slate-800 hover:text-white',
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md hover:bg-slate-800 transition-colors text-red-400 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative z-0">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
