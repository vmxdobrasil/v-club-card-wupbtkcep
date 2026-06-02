import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, Users, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

export default function MasterDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    holders: 0,
    transactions: 0,
    volume: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [companies, holders, transactions] = await Promise.all([
          pb.collection('companies').getList(1, 1),
          pb.collection('card_holders').getList(1, 1),
          pb.collection('transactions').getList(1, 50, { filter: 'status="approved"' }),
        ])

        const volume = transactions.items.reduce((acc, curr) => acc + (curr.amount || 0), 0)

        setStats({
          companies: companies.totalItems,
          holders: holders.totalItems,
          transactions: transactions.totalItems,
          volume,
        })
      } catch (e) {
        console.error('Error fetching stats', e)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Master</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema V Club Card, sem métricas de diagnóstico visíveis para o usuário.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Transacionado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.volume,
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
