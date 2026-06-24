import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, CreditCard, DollarSign, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

export default function MasterDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    companies: 0,
    holders: 0,
    activeCards: 0,
    volume: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [companies, holders, transactions] = await Promise.all([
          pb.collection('companies').getList(1, 1, { filter: "deleted_at = ''" }),
          pb.collection('card_holders').getList(1, 1, { filter: "deleted_at = ''" }),
          pb.collection('transactions').getFullList({ filter: "status = 'approved'" }),
        ])

        const activeCards = await pb.collection('card_holders').getList(1, 1, {
          filter: "status = 'active' && deleted_at = ''",
        })

        const volume = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0)

        setStats({
          companies: companies.totalItems,
          holders: holders.totalItems,
          activeCards: activeCards.totalItems,
          volume,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Master</h1>
          <p className="text-muted-foreground">Visão geral da plataforma V Club Card.</p>
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault()
            navigate('/companies')
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Empresa
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-primary shadow-lg relative overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <Building className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Empresas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Building className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-accent shadow-lg relative overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <Users className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Titulares
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.holders}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#06b6d4] shadow-lg relative overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <CreditCard className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cartões Ativos
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-[#06b6d4]/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#06b6d4]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCards}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-success shadow-lg relative overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <DollarSign className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume Transacionado
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
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
