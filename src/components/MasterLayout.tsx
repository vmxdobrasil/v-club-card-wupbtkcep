import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function MasterLayout() {
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
            to="/master"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/master' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Dashboard
          </Link>
          <Link
            to="/companies"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/companies' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Companies
          </Link>
          <Link
            to="/bin"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/bin' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            BINs
          </Link>
          <Link
            to="/partners"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/partners' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Partners
          </Link>
          <Link
            to="/products"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/products' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Products
          </Link>
          <Link
            to="/catalogos"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname.startsWith('/catalogos') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Catalogs
          </Link>
          <Link
            to="/usuarios"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/usuarios' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Holders
          </Link>
          <Link
            to="/lixeira"
            className={`block px-4 py-2.5 rounded transition-colors ${location.pathname === '/lixeira' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            Trash
          </Link>
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
