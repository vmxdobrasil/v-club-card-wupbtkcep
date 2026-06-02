import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { Building, Users, CreditCard } from 'lucide-react'

export default function MasterDashboard() {
  const [stats, setStats] = useState({ companies: 0, holders: 0, transactions: 0 })

  const loadStats = async () => {
    try {
      const [comps, holders, txs] = await Promise.all([
        pb.collection('companies').getList(1, 1),
        pb.collection('card_holders').getList(1, 1),
        pb.collection('transactions').getList(1, 1),
      ])
      setStats({
        companies: comps.totalItems,
        holders: holders.totalItems,
        transactions: txs.totalItems,
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useRealtime('companies', loadStats)
  useRealtime('card_holders', loadStats)
  useRealtime('transactions', loadStats)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Master Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Titulares de Cartão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
