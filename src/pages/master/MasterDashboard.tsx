import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Building2, BookOpen, Users, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

export default function MasterDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    catalogs: 0,
    partners: 0,
    holders: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [companies, catalogs, holders] = await Promise.all([
          pb.collection('companies').getList(1, 1, { filter: "deleted_at = ''" }),
          pb.collection('catalogs').getList(1, 1, { filter: "deleted_at = ''" }),
          pb.collection('card_holders').getList(1, 1, { filter: "deleted_at = ''" }),
        ])

        // Count partners from users where role = partner
        const partners = await pb.collection('users').getList(1, 1, { filter: "role = 'partner'" })

        setStats({
          companies: companies.totalItems,
          catalogs: catalogs.totalItems,
          partners: partners.totalItems,
          holders: holders.totalItems,
        })
      } catch (err) {
        console.error('Erro ao buscar estatísticas', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empresas Ativas</CardTitle>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.companies}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Catálogos</CardTitle>
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.catalogs}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Parceiros</CardTitle>
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.partners}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Portadores</CardTitle>
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.holders}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
