import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { LayoutDashboard, ShoppingBag, BookOpen, Bot, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function DashboardLayout({ role }: { role: 'company' | 'partner' | 'holder' }) {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b flex items-center justify-between">
          <span className="font-bold text-lg capitalize">
            {role === 'company' ? 'Empresa' : role === 'partner' ? 'Parceiro' : 'Titular'}
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === `/${role}`}>
                <Link to={`/${role}`}>
                  {role === 'holder' ? <CreditCard /> : <LayoutDashboard />}
                  {role === 'holder' ? 'Meu Cartão' : 'Dashboard'}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {role === 'company' && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/company/catalogos'}>
                    <Link to="/company/catalogos">
                      <BookOpen /> Catálogos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/company/ai-agent'}>
                    <Link to="/company/ai-agent">
                      <Bot /> Assistente AI
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            {role === 'partner' && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/partner/products'}>
                    <Link to="/partner/products">
                      <ShoppingBag /> Produtos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/partner/catalogos'}>
                    <Link to="/partner/catalogos">
                      <BookOpen /> Catálogos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>Sair</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-safe">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
