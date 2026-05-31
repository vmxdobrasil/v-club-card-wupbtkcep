import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, ShoppingBag, LogOut, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const getNavItems = () => {
    switch (role) {
      case 'company':
        return [
          { title: 'Dashboard', href: '/company', icon: LayoutDashboard },
          { title: 'Catálogos', href: '/company/catalogos', icon: CreditCard },
          { title: 'AI Agent', href: '/company/ai-agent', icon: Bot },
        ]
      case 'partner':
        return [
          { title: 'Dashboard', href: '/partner', icon: LayoutDashboard },
          { title: 'Produtos', href: '/partner/products', icon: ShoppingBag },
          { title: 'Catálogos', href: '/partner/catalogos', icon: CreditCard },
        ]
      case 'holder':
        return [{ title: 'Dashboard', href: '/holder', icon: LayoutDashboard }]
      default:
        return []
    }
  }

  const NAV_ITEMS = getNavItems()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20 relative">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-4">
            <div className="flex items-center gap-2 font-semibold capitalize">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                V
              </div>
              V Club {role}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2 py-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col w-full relative z-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
