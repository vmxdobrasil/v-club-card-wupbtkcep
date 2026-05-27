import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Package, BookOpen, Users } from 'lucide-react'
import { getCompanies } from '@/services/companies'
import pb from '@/lib/pocketbase/client'

export default function MasterDashboard() {
  const [stats, setStats] = useState({ companies: 0, products: 0, catalogs: 0, partners: 0 })

  useEffect(() => {
    Promise.all([
      getCompanies()
        .then((c) => c.length)
        .catch(() => 0),
      pb
        .collection('products')
        .getList(1, 1)
        .then((r) => r.totalItems)
        .catch(() => 0),
      pb
        .collection('catalogs')
        .getList(1, 1)
        .then((r) => r.totalItems)
        .catch(() => 0),
      pb
        .collection('users')
        .getList(1, 1, { filter: "role='partner'" })
        .then((r) => r.totalItems)
        .catch(() => 0),
    ]).then(([companies, products, catalogs, partners]) => {
      setStats({ companies, products, catalogs, partners })
    })
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Catálogos</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.catalogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partners}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
