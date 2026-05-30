import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Package, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { signOut } = useAuth()
  const location = useLocation()

  const getNavItems = () => {
    switch (role) {
      case 'company':
        return [
          { path: '/company', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/company/catalogos', label: 'Catálogos', icon: Package },
        ]
      case 'partner':
        return [
          { path: '/partner', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/partner/products', label: 'Produtos', icon: Package },
          { path: '/partner/catalogos', label: 'Catálogos', icon: Package },
        ]
      case 'holder':
        return [{ path: '/holder', label: 'Dashboard', icon: LayoutDashboard }]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="justify-start gap-3 px-3 py-2 mt-auto text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={signOut}
      >
        <LogOut className="h-5 w-5" />
        Sair
      </Button>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background p-4 space-y-2">
        <div className="mb-6 px-3">
          <h2 className="text-2xl font-bold tracking-tight capitalize">{role} Admin</h2>
        </div>
        <NavLinks />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex md:hidden h-14 items-center border-b bg-background px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 flex flex-col p-4 space-y-2">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="text-xl font-bold tracking-tight capitalize">
                  {role} Admin
                </SheetTitle>
              </SheetHeader>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">V Club Card</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
