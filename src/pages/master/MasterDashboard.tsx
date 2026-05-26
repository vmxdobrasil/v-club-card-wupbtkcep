import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building, BookOpen, Package, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MasterDashboard() {
  const cards = [
    {
      title: 'Companies',
      desc: 'Manage client companies',
      icon: Building,
      link: '/master/companies',
    },
    {
      title: 'Products',
      desc: 'Global product inventory',
      icon: Package,
      link: '/master/products',
    },
    { title: 'Catalogs', desc: 'Promotional campaigns', icon: BookOpen, link: '/master/catalogs' },
    { title: 'Partners', desc: 'Affiliates and resellers', icon: Users, link: '/master/partners' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to the administration control panel.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <Link key={c.title} to={c.link} className="block group">
            <Card className="hover:shadow-md transition-shadow h-full border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{c.title}</CardTitle>
                <c.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm font-medium">{c.desc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
