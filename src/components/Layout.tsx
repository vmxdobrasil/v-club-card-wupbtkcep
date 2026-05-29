import { Outlet, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/whatsapp-image.jpeg"
              alt="V Club Card Logo"
              className="h-10 w-auto object-contain rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <span className="hidden text-xl font-bold text-primary">V Club Card</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/master">Painel Master</Link>
            </Button>
            <Button asChild>
              <Link to="/holder">Acessar Conta</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-slate-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600 space-y-2">
          <p className="font-semibold text-slate-900 text-base">V Club Card</p>
          <p>
            Operado por:{' '}
            <span className="font-medium">
              Vmx do Brasil Administradora de Cartões e Benefícios Ltda
            </span>
          </p>
          <p className="text-xs text-slate-500">BIN Oficial: 636943</p>
        </div>
      </footer>
    </div>
  )
}
