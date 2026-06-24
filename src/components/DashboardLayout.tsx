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
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg'

export function DashboardLayout({ role }: { role: 'company' | 'partner' | 'holder' }) {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b flex justify-center items-center min-h-[64px]">
          <img src={cardImage} alt="V Club" className="max-h-10 w-auto object-contain" />
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
      <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-background">
        <header className="flex h-16 items-center gap-4 border-b px-4 lg:px-6 bg-card shadow-sm z-10">
          <SidebarTrigger />
          <div className="flex-1 font-semibold text-muted-foreground capitalize flex justify-end">
            Painel {role === 'company' ? 'Empresa' : role === 'partner' ? 'Parceiro' : 'Titular'}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-safe">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
