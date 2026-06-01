import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Building2,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  Trash2,
  Box,
  Library,
  UserCircle,
} from 'lucide-react'

export function MasterLayout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard', path: '/master', icon: LayoutDashboard },
    { title: 'Empresas', path: '/companies', icon: Building2 },
    { title: 'Parceiros', path: '/partners', icon: Users },
    { title: 'Produtos', path: '/products', icon: Box },
    { title: 'Catálogos', path: '/catalogos', icon: Library },
    { title: 'Usuários', path: '/usuarios', icon: UserCircle },
    { title: 'Secrets', path: '/master/secrets', icon: Settings },
    { title: 'Lixeira', path: '/lixeira', icon: Trash2 },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-xl font-bold">V Club Card</h2>
            <p className="text-xs text-muted-foreground">Master Admin</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                        <Link to={item.path}>
                          <item.icon className="w-4 h-4 mr-2" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            {user?.email && (
              <div className="mb-4 px-2 text-sm text-muted-foreground truncate">{user.email}</div>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} className="text-red-500 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-white flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
