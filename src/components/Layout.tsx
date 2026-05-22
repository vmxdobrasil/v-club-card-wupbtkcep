import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { SidebarProvider } from '@/components/ui/sidebar'
import useAuthStore from '@/stores/use-auth-store'
import { AppSidebar } from './AppSidebar'
import { TopHeader } from './TopHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user } = useAuthStore()
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()

  const isHolder = user.role === 'holder'
  const isGuest = user.role === 'guest'

  useEffect(() => {
    if (isGuest && location.pathname !== '/') {
      navigate('/')
    }
  }, [isGuest, location.pathname, navigate])

  if (isGuest) {
    return (
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900/50">
        {!isHolder && <AppSidebar />}
        <main
          className={cn(
            'flex-1 flex flex-col w-full min-h-screen transition-all duration-300',
            isHolder && isMobile && 'pb-16', // Space for bottom nav
          )}
        >
          <TopHeader />
          <div className="flex-1 p-4 md:p-8 max-w-[1440px] mx-auto w-full animate-fade-in-up">
            <Outlet />
          </div>
        </main>
        {isHolder && isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  )
}
