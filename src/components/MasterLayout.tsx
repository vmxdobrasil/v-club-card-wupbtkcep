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
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Building2, Trash2, Users, Package, FileText, LayoutDashboard, LogOut } from 'lucide-react'

export function MasterLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="flex items-center justify-center p-6 border-b border-sidebar-border">
            <h2 className="text-2xl font-black text-blue-900 tracking-tighter">V CLUB CARD</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Master Admin
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
                    <SidebarMenuButton asChild isActive={location.pathname === '/master'}>
                      <Link to="/master">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/companies'}>
                      <Link to="/companies">
                        <Building2 className="mr-3 h-4 w-4" />
                        <span className="font-medium">Empresas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/bin'}>
                      <Link to="/bin">
                        <FileText className="mr-3 h-4 w-4" />
                        <span className="font-medium">Gestão de BIN</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/partners'}>
                      <Link to="/partners">
                        <Users className="mr-3 h-4 w-4" />
                        <span className="font-medium">Parceiros</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/products'}>
                      <Link to="/products">
                        <Package className="mr-3 h-4 w-4" />
                        <span className="font-medium">Produtos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/catalogos'}>
                      <Link to="/catalogos">
                        <FileText className="mr-3 h-4 w-4" />
                        <span className="font-medium">Catálogos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/usuarios'}>
                      <Link to="/usuarios">
                        <Users className="mr-3 h-4 w-4" />
                        <span className="font-medium">Portadores</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/lixeira'}>
                      <Link to="/lixeira">
                        <Trash2 className="mr-3 h-4 w-4" />
                        <span className="font-medium">Lixeira</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
