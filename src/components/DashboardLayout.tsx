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
} from '@/components/ui/sidebar'
import { LayoutDashboard, BookOpen, Bot, Package, CreditCard } from 'lucide-react'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg'

interface DashboardLayoutProps {
  role: 'company' | 'holder' | 'partner'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const menuItems = {
    company: [
      { path: '/company', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/company/catalogs', label: 'My Catalogs', icon: BookOpen },
      { path: '/company/ai-agent', label: 'AI Agent', icon: Bot },
    ],
    partner: [
      { path: '/partner', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/partner/products', label: 'Products', icon: Package },
      { path: '/partner/catalogs', label: 'Catalogs', icon: BookOpen },
    ],
    holder: [{ path: '/holder', label: 'My Card', icon: CreditCard }],
  }

  const items = menuItems[role] || []
  const basePath = `/${role}`

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border/50 bg-sidebar">
          <SidebarHeader className="p-4 border-b border-border/50 flex justify-center items-center">
            <Link
              to={basePath}
              className="block w-full max-w-[200px] transition-transform hover:scale-[1.02]"
            >
              <img
                src={cardImage}
                alt="V Club Card"
                className="w-full h-auto object-contain rounded-xl shadow-sm"
              />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-3">
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                    <Link to={item.path}>
                      <item.icon className="w-4 h-4 mr-2" /> {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <header className="h-16 flex items-center px-4 border-b border-border/50 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <SidebarTrigger className="-ml-2" />
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
