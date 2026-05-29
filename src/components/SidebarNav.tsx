import { NavLink } from 'react-router-dom'
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Store,
  PieChart,
  Users,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import useAuthStore from '@/stores/use-auth-store'
import { cn } from '@/lib/utils'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-08.18.14-1-9a666.jpeg'

export function SidebarNav() {
  const { role } = useAuthStore()

  const links = {
    master: [
      { to: '/master', icon: LayoutDashboard, label: 'Início' },
      { to: '/master/companies', icon: Building2, label: 'Empresas' },
      { to: '/master/bin', icon: CreditCard, label: 'Prefixo BIN' },
      { to: '/master/partners', icon: Users, label: 'Parceiros' },
      { to: '/master/catalogs', icon: Store, label: 'Catálogos' },
      { to: '/master/products', icon: Receipt, label: 'Produtos' },
    ],
    company: [
      { to: '/company', icon: LayoutDashboard, label: 'Início' },
      { to: '/company/holders', icon: Users, label: 'Portadores' },
      { to: '/company/partners', icon: Store, label: 'Parceiros' },
      { to: '/company/catalogs', icon: Store, label: 'Catálogos' },
    ],
    partner: [
      { to: '/partner', icon: LayoutDashboard, label: 'Início' },
      { to: '/partner/products', icon: Store, label: 'Produtos' },
      { to: '/partner/catalogs', icon: Store, label: 'Catálogos' },
    ],
    holder: [
      { to: '/holder', icon: CreditCard, label: 'Início' },
      { to: '/holder/partners', icon: Store, label: 'Parceiros' },
    ],
  }

  const currentLinks = role ? links[role] : []

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b justify-center">
        <img src={cardImage} alt="V Club Card" className="h-10 w-auto rounded object-contain" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {currentLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
