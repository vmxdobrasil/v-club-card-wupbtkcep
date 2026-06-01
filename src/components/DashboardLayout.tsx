import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { LayoutDashboard, BookOpen, Bot, Package, LogOut, Building } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  const menus = {
    company: [
      { title: 'Dashboard', url: '/company', icon: LayoutDashboard },
      { title: 'Catálogos', url: '/company/catalogos', icon: BookOpen },
      { title: 'AI Agent', url: '/company/ai-agent', icon: Bot },
    ],
    partner: [
      { title: 'Dashboard', url: '/partner', icon: LayoutDashboard },
      { title: 'Produtos', url: '/partner/products', icon: Package },
      { title: 'Catálogos', url: '/partner/catalogos', icon: BookOpen },
    ],
    holder: [{ title: 'Dashboard', url: '/holder', icon: LayoutDashboard }],
  }

  const roleMenu = menus[role] || []

  const roleTitles = {
    company: 'Painel da Empresa',
    partner: 'Painel do Parceiro',
    holder: 'Meu Cartão',
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">{roleTitles[role]}</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {roleMenu.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <SidebarMenuButton
            onClick={signOut}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </SidebarMenuButton>
        </div>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 min-w-0 bg-muted/30">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
