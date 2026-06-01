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
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Package,
  BookOpen,
  UserCircle,
  Trash2,
  KeyRound,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const menuItems = [
  { title: 'Dashboard', url: '/master', icon: LayoutDashboard },
  { title: 'Empresas', url: '/companies', icon: Building2 },
  { title: 'BINs', url: '/bin', icon: CreditCard },
  { title: 'Parceiros', url: '/partners', icon: Users },
  { title: 'Produtos', url: '/products', icon: Package },
  { title: 'Catálogos', url: '/catalogos', icon: BookOpen },
  { title: 'Usuários', url: '/usuarios', icon: UserCircle },
  { title: 'Segredos', url: '/master/secrets', icon: KeyRound },
  { title: 'Lixeira', url: '/lixeira', icon: Trash2 },
]

export function MasterLayout() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Master Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
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
