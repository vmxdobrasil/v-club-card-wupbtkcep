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
import { LayoutDashboard, Building, Trash2, Key, Users, BookOpen, Package } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function MasterLayout() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b flex items-center justify-between">
          <span className="font-bold text-lg">V Club Master</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/master'}>
                <Link to="/master">
                  <LayoutDashboard /> Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/companies'}>
                <Link to="/companies">
                  <Building /> Empresas
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/partners'}>
                <Link to="/partners">
                  <Users /> Parceiros
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/products'}>
                <Link to="/products">
                  <Package /> Produtos
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/catalogos'}>
                <Link to="/catalogos">
                  <BookOpen /> Catálogos
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/usuarios'}>
                <Link to="/usuarios">
                  <Users /> Titulares
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/lixeira'}>
                <Link to="/lixeira">
                  <Trash2 /> Lixeira
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/master/secrets'}>
                <Link to="/master/secrets">
                  <Key /> Secrets
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>Sair</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-safe">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
