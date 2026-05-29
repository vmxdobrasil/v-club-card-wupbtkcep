import { Outlet, useLocation } from 'react-router-dom'
import { TopHeader } from './TopHeader'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()

  // Rotas públicas e rotas master que têm seu próprio layout
  const isPublicRoute = location.pathname === '/' || location.pathname.startsWith('/catalog/')
  const isMasterRoute =
    location.pathname.startsWith('/master') ||
    location.pathname === '/bin' ||
    location.pathname === '/partners' ||
    location.pathname === '/products' ||
    location.pathname.startsWith('/catalogs/')

  if (isPublicRoute || isMasterRoute || !user) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {user.role !== 'holder' && <AppSidebar />}
        <div className="flex flex-col flex-1 w-full min-w-0">
          <TopHeader />
          <main className="flex-1 overflow-auto pb-16 md:pb-0 p-4 lg:p-8 bg-muted/10">
            <Outlet />
          </main>
          {user.role === 'holder' && <BottomNav />}
        </div>
      </div>
    </SidebarProvider>
  )
}
