import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Building2,
  Users,
  ShoppingBag,
  LayoutDashboard,
  Trash2,
  Library,
  LogOut,
  CreditCard,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg'

export function MasterLayout() {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/master', icon: LayoutDashboard },
    { name: 'Empresas', href: '/companies', icon: Building2 },
    { name: 'BINs', href: '/bin', icon: CreditCard },
    { name: 'Parceiros', href: '/partners', icon: Users },
    { name: 'Produtos', href: '/products', icon: ShoppingBag },
    { name: 'Catálogos', href: '/catalogos', icon: Library },
    { name: 'Usuários', href: '/usuarios', icon: Users },
    { name: 'Lixeira', href: '/lixeira', icon: Trash2 },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <img
                src={cardImage}
                alt="V Club Card"
                className="h-8 w-auto rounded object-contain"
              />
              <span className="truncate">V Club Card</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.href ||
                      location.pathname.startsWith(`${item.href}/`)
                    }
                  >
                    <Link to={item.href} className="flex items-center gap-3 px-4 py-2">
                      <item.icon className="size-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="text-sm font-medium truncate">
                  {user?.name || 'Administrador'}
                </span>
                <span className="text-xs text-slate-500 truncate">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sair">
                <LogOut className="size-4 shrink-0" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-white lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="font-bold">V Club Card</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
