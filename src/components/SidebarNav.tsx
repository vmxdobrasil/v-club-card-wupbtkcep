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

export function SidebarNav() {
  const { role } = useAuthStore()

  const links = {
    master: [
      { to: '/master', icon: LayoutDashboard, label: 'Painel Global' },
      { to: '/master/companies', icon: Building2, label: 'Empresas' },
      { to: '/master/bin', icon: CreditCard, label: 'Controle de BIN' },
      { to: '/master/audit', icon: ShieldCheck, label: 'Auditoria' },
      { to: '/master/catalogs', icon: Store, label: 'Catálogos' },
      { to: '/master/products', icon: Receipt, label: 'Produtos' },
    ],
    company: [
      { to: '/company', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/company/holders', icon: Users, label: 'Portadores' },
      { to: '/company/payroll', icon: Receipt, label: 'Folha Consignada' },
      { to: '/company/partners', icon: Store, label: 'Rede Parceira' },
      { to: '/company/catalogs', icon: Store, label: 'Catálogos' },
    ],
    partner: [
      { to: '/partner', icon: LayoutDashboard, label: 'Visão Geral' },
      { to: '/partner/charge', icon: Receipt, label: 'Cobrar (QR)' },
      { to: '/partner/transactions', icon: PieChart, label: 'Extrato' },
      { to: '/partner/products', icon: Store, label: 'Meus Produtos' },
    ],
    holder: [
      { to: '/holder', icon: CreditCard, label: 'Minha Carteira' },
      { to: '/holder/transactions', icon: Receipt, label: 'Transações' },
      { to: '/holder/partners', icon: Store, label: 'Onde Comprar' },
    ],
  }

  const currentLinks = role ? links[role] : []

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center text-primary-foreground">
            V
          </div>
          Club Card
        </div>
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
