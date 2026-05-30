import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { LayoutDashboard, FileText, Bot, Package, LogOut } from 'lucide-react'

export function DashboardLayout({ role }: { role: 'company' | 'holder' | 'partner' }) {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="flex flex-col items-center justify-center p-6 border-b border-sidebar-border">
            <h2 className="text-2xl font-black text-blue-900 tracking-tighter">V CLUB CARD</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              PAINEL {role === 'company' ? 'EMPRESA' : role === 'holder' ? 'PORTADOR' : 'PARCEIRO'}
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-2 mt-2 text-xs font-medium text-slate-400">
                MENU PRINCIPAL
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === `/${role}`}>
                      <Link to={`/${role}`}>
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {role === 'company' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/company/catalogos'}
                        >
                          <Link to="/company/catalogos">
                            <FileText className="mr-3 h-4 w-4" />
                            <span className="font-medium">Catálogos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/company/ai-agent'}
                        >
                          <Link to="/company/ai-agent">
                            <Bot className="mr-3 h-4 w-4" />
                            <span className="font-medium">Agente IA</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {role === 'partner' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/partner/products'}
                        >
                          <Link to="/partner/products">
                            <Package className="mr-3 h-4 w-4" />
                            <span className="font-medium">Produtos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === '/partner/catalogos'}
                        >
                          <Link to="/partner/catalogos">
                            <FileText className="mr-3 h-4 w-4" />
                            <span className="font-medium">Catálogos</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
