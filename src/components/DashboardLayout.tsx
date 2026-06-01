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
import { LayoutDashboard, LogOut, Library, Box, Bot } from 'lucide-react'

export function DashboardLayout({ role }: { role: 'company' | 'holder' | 'partner' }) {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const navItems = {
    company: [
      { title: 'Dashboard', path: '/company', icon: LayoutDashboard },
      { title: 'Catálogos', path: '/company/catalogos', icon: Library },
      { title: 'AI Agent', path: '/company/ai-agent', icon: Bot },
    ],
    holder: [{ title: 'Dashboard', path: '/holder', icon: LayoutDashboard }],
    partner: [
      { title: 'Dashboard', path: '/partner', icon: LayoutDashboard },
      { title: 'Produtos', path: '/partner/products', icon: Box },
      { title: 'Catálogos', path: '/partner/catalogos', icon: Library },
    ],
  }

  const items = navItems[role] || []

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-xl font-bold">V Club Card</h2>
            <p className="text-xs text-muted-foreground capitalize">{role} Panel</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
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
