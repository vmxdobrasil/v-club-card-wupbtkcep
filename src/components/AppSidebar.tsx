import { Link, useLocation } from 'react-router-dom'
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
import useAuthStore from '@/stores/use-auth-store'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const navItems = {
    master: [
      { title: 'Dashboard Global', url: '/master', icon: LayoutDashboard },
      { title: 'Controle de BINs', url: '#', icon: CreditCard },
      { title: 'Empresas Clientes', url: '#', icon: Store },
      { title: 'Relatórios Financeiros', url: '#', icon: PieChart },
      { title: 'Auditoria', url: '#', icon: ShieldAlert },
    ],
    company: [
      { title: 'Painel da Empresa', url: '/company', icon: LayoutDashboard },
      { title: 'Portadores (Colaboradores)', url: '#', icon: Users },
      { title: 'Gestão de Limites', url: '#', icon: CreditCard },
      { title: 'Arquivos de Folha', url: '#', icon: FileText },
      { title: 'Rede de Parceiros', url: '#', icon: Store },
      { title: 'Configurações', url: '#', icon: Settings },
    ],
    partner: [
      { title: 'Painel do Parceiro', url: '/partner', icon: LayoutDashboard },
      { title: 'Transações', url: '#', icon: FileText },
      { title: 'Extrato e Repasses', url: '#', icon: PieChart },
      { title: 'Minha Loja', url: '#', icon: Store },
    ],
  }

  const items =
    user.role !== 'guest' && user.role !== 'holder'
      ? navItems[user.role as keyof typeof navItems]
      : []

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="font-bold text-xl flex items-center gap-2 text-sidebar-primary">
          <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center text-sidebar-primary-foreground italic text-lg">
            V
          </div>
          Club <span className="text-secondary font-normal">Card</span>
        </div>
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
