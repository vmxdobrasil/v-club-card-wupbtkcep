import { Link, useLocation } from 'react-router-dom'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-08.18.14-1-9a666.jpeg'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Store,
  PieChart,
  FileText,
  ShieldAlert,
} from 'lucide-react'
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
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = {
    master: [
      { title: 'Início', url: '/master', icon: LayoutDashboard },
      { title: 'Prefixo BIN', url: '/master/bin', icon: CreditCard },
      { title: 'Empresas', url: '/master/companies', icon: Store },
      { title: 'Catálogos', url: '/master/catalogs', icon: Store },
      { title: 'Produtos', url: '/master/products', icon: FileText },
      { title: 'Parceiros', url: '/master/partners', icon: Users },
    ],
    company: [
      { title: 'Início', url: '/company', icon: LayoutDashboard },
      { title: 'Portadores', url: '/company/holders', icon: Users },
      { title: 'Parceiros', url: '/company/partners', icon: Store },
      { title: 'Catálogos', url: '/company/catalogs', icon: Store },
    ],
    partner: [
      { title: 'Início', url: '/partner', icon: LayoutDashboard },
      { title: 'Produtos', url: '/partner/products', icon: Store },
      { title: 'Catálogos', url: '/partner/catalogs', icon: Store },
    ],
  }

  const items =
    user && user.role !== 'holder' ? navItems[user.role as keyof typeof navItems] || [] : []

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border justify-center">
        <img src={cardImage} alt="V Club Card" className="h-10 w-auto rounded object-contain" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mt-4">
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
