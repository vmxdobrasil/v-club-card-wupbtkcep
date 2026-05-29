import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ role }: { role: string }) {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex w-full">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center justify-center border-b border-slate-800">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg"
            alt="V Club Card"
            className="h-16 w-auto object-contain rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://img.usecurling.com/i?q=vclub&color=blue&shape=fill'
            }}
          />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to={`/${role}`}
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === `/${role}` ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Dashboard
          </Link>
          {role === 'company' && (
            <>
              <Link
                to="/company/catalogos"
                className={`block px-4 py-2.5 rounded transition-colors ${location.pathname.includes('/catalogos') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Catalogs
              </Link>
              <Link
                to="/company/ai-agent"
                className={`block px-4 py-2.5 rounded transition-colors ${location.pathname.includes('/ai-agent') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                AI Agent
              </Link>
            </>
          )}
          {role === 'partner' && (
            <>
              <Link
                to="/partner/products"
                className={`block px-4 py-2.5 rounded transition-colors ${location.pathname.includes('/products') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Products
              </Link>
              <Link
                to="/partner/catalogos"
                className={`block px-4 py-2.5 rounded transition-colors ${location.pathname.includes('/catalogos') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Catalogs
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={signOut}
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
