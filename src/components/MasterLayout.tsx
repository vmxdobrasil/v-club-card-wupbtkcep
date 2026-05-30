import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Trash2,
  LogOut,
  Package,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function MasterLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar variant="sidebar">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-lg font-bold text-blue-600">Admin Master</h2>
          </SidebarHeader>
          <SidebarContent className="px-2 mt-4 space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/master'}>
                  <Link to="/master">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/companies'}>
                  <Link to="/companies">
                    <Building2 className="w-4 h-4" />
                    <span>Empresas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/catalogos')}>
                  <Link to="/catalogos">
                    <BookOpen className="w-4 h-4" />
                    <span>Catálogos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/products'}>
                  <Link to="/products">
                    <Package className="w-4 h-4" />
                    <span>Produtos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/partners'}>
                  <Link to="/partners">
                    <Users className="w-4 h-4" />
                    <span>Parceiros</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/usuarios'}>
                  <Link to="/usuarios">
                    <CreditCard className="w-4 h-4" />
                    <span>Portadores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/lixeira' || location.pathname === '/bin'}
                >
                  <Link to="/bin">
                    <Trash2 className="w-4 h-4" />
                    <span>Lixeira</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <SidebarMenuButton
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto flex flex-col">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
