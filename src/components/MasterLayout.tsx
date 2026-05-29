import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
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
import { Building2, CreditCard, Users, Package, BookOpen, LayoutDashboard } from 'lucide-react'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg'

export function MasterLayout() {
  const location = useLocation()
  const { user, loading } = useAuth()

  const isActive = (path: string) => location.pathname === path

  if (loading) return null
  if (!user || user.role !== 'master') return <Navigate to="/" replace />

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border/50 bg-sidebar">
          <SidebarHeader className="p-4 border-b border-border/50 flex justify-center items-center">
            <Link
              to="/master"
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/master')} tooltip="Dashboard">
                  <Link to="/master">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/master/companies')}
                  tooltip="Companies"
                >
                  <Link to="/master/companies">
                    <Building2 className="w-4 h-4 mr-2" /> Companies
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/master/bin')} tooltip="BIN Prefix">
                  <Link to="/master/bin">
                    <CreditCard className="w-4 h-4 mr-2" /> BIN Prefix
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/master/partners')}
                  tooltip="Partners"
                >
                  <Link to="/master/partners">
                    <Users className="w-4 h-4 mr-2" /> Partners
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/master/products')}
                  tooltip="Products"
                >
                  <Link to="/master/products">
                    <Package className="w-4 h-4 mr-2" /> Products
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/master/catalogs')}
                  tooltip="Catalogs"
                >
                  <Link to="/master/catalogs">
                    <BookOpen className="w-4 h-4 mr-2" /> Catalogs
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
