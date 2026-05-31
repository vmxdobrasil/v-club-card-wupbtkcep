import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Building2,
  Users,
  ShoppingBag,
  LayoutGrid,
  Trash2,
  ShieldAlert,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function MasterLayout() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="p-4 font-bold text-lg border-b">V Club Master</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/master'}>
                      <Link to="/master">
                        <LayoutGrid className="w-4 h-4 mr-2" /> Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/companies'}>
                      <Link to="/companies">
                        <Building2 className="w-4 h-4 mr-2" /> Empresas
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/usuarios'}>
                      <Link to="/usuarios">
                        <Users className="w-4 h-4 mr-2" /> Portadores
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/products'}>
                      <Link to="/products">
                        <ShoppingBag className="w-4 h-4 mr-2" /> Produtos
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/catalogos'}>
                      <Link to="/catalogos">
                        <LayoutGrid className="w-4 h-4 mr-2" /> Catálogos
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/master/secrets'}>
                      <Link to="/master/secrets">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Configurações
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/lixeira'}>
                      <Link to="/lixeira">
                        <Trash2 className="w-4 h-4 mr-2" /> Lixeira
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} className="text-red-500 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
