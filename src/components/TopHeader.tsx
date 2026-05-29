import { useAuth } from '@/hooks/use-auth'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useNavigate } from 'react-router-dom'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-08.18.14-1-9a666.jpeg'

export function TopHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {user?.role !== 'holder' && <SidebarTrigger />}
        {user?.role === 'holder' && (
          <img src={cardImage} alt="V Club Card" className="h-10 w-auto rounded object-contain" />
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-medium">{user?.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
        </div>
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
