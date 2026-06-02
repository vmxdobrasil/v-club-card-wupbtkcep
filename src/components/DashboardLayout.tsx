import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, Package, Bot, LogOut, Plus } from 'lucide-react'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { signOut } = useAuth()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const basePath = `/${role}`

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
            <span className="text-xl font-bold tracking-tight text-primary">V Club Card</span>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(basePath)}>
                  <Link to={basePath}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {(role === 'company' || role === 'partner') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(`${basePath}/catalogos`)}>
                    <Link to={`${basePath}/catalogos`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Catálogos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {role === 'partner' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(`${basePath}/products`)}>
                    <Link to={`${basePath}/products`}>
                      <Package className="w-4 h-4 mr-2" />
                      Produtos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {role === 'company' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(`${basePath}/ai-agent`)}>
                    <Link to={`${basePath}/ai-agent`}>
                      <Bot className="w-4 h-4 mr-2" />
                      Agente de IA
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-white shadow-sm shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground hidden sm:block capitalize">
                Painel {role}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-md hover:shadow-lg transition-all"
                title="Nova Ação"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
