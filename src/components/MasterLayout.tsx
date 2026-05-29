import { Outlet, Link, useLocation } from 'react-router-dom'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-08.18.14-1-9a666.jpeg'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ShoppingBag,
  FolderTree,
} from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const navigation = [
  { name: 'Dashboard', href: '/master', icon: LayoutDashboard },
  { name: 'Empresas', href: '/master/companies', icon: Building2 },
  { name: 'Prefixos BIN', href: '/master/bin', icon: CreditCard },
  { name: 'Parceiros', href: '/master/partners', icon: Users },
  { name: 'Produtos', href: '/master/products', icon: ShoppingBag },
  { name: 'Catálogos', href: '/master/catalogs', icon: FolderTree },
]

export function MasterLayout() {
  const location = useLocation()

  const currentItem = navigation.find((item) =>
    item.href === '/master'
      ? location.pathname === '/master'
      : location.pathname.startsWith(item.href),
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center px-4 border-b justify-center">
          <img src={cardImage} alt="V Club Card" className="h-10 w-auto rounded object-contain" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administração Global</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const isActive =
                    item.href === '/master'
                      ? location.pathname === '/master'
                      : location.pathname.startsWith(item.href)

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                        <Link to={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">{currentItem?.name || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Nível 0 - Acesso Master</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-muted/10 p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
