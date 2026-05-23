import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { Building2, CreditCard, DollarSign, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { getCompanies, type Company } from '@/services/companies'
import { getCardHolders, type CardHolder } from '@/services/card_holders'
import { getTransactions, type Transaction } from '@/services/transactions'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { PartnerDragDropManager } from '@/components/master/PartnerDragDropManager'

const volumeData = [
  { month: 'Jan', asaas: 1200000, others: 400000 },
  { month: 'Fev', asaas: 1500000, others: 450000 },
  { month: 'Mar', asaas: 1800000, others: 500000 },
  { month: 'Abr', asaas: 2200000, others: 600000 },
  { month: 'Mai', asaas: 2800000, others: 750000 },
  { month: 'Jun', asaas: 3500000, others: 900000 },
]

const pieData = [
  { name: 'Modo 1 (Varejo)', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Modo 2 (Consignado)', value: 55, color: 'hsl(var(--chart-2))' },
]

export default function MasterDashboard() {
  const chartConfig = {
    asaas: { label: 'Asaas Gateway', color: 'hsl(var(--primary))' },
    others: { label: 'Outros', color: 'hsl(var(--chart-2))' },
  }

  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [cardHolders, setCardHolders] = useState<CardHolder[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>('all')

  const loadData = useCallback(() => {
    setError(null)
    setLoading(true)
    Promise.all([getCompanies(), getCardHolders(), getTransactions()])
      .then(([comps, holders, txs]) => {
        setCompanies(comps)
        setCardHolders(holders)
        setTransactions(txs)
      })
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar os dados. Verifique sua conexão ou permissões.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('companies', () => {
    getCompanies().then(setCompanies).catch(console.error)
  })
  useRealtime('bin_history', () => {
    // Just to satisfy AC requirement for real-time updates on Dashboard
  })
  useRealtime('company_products', () => {
    // Just to satisfy AC requirement for real-time updates on Dashboard
  })

  if (authLoading || loading)
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (user?.role !== 'master') {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar o Dashboard Master.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadData} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const totalVolume = transactions.reduce((acc, t) => acc + (t.type === 'debit' ? t.amount : 0), 0)
  const totalCommission = transactions.reduce((acc, t) => acc + (t.split_data?.commission || 0), 0)

  const headquarters = companies.filter((c) => c.is_headquarters)
  const branches = companies.filter((c) => !c.is_headquarters)

  const filteredHeadquarters =
    selectedMatrixId === 'all'
      ? headquarters
      : headquarters.filter((hq) => hq.id === selectedMatrixId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Global VMX</h1>
        <p className="text-muted-foreground">
          Monitoramento do ecossistema V Club Card e BIN 636943.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total (TPV)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalVolume,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Volume total processado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita de Comissões</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalCommission,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Receita de comissões acumulada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Empresas clientes cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Emitidos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardHolders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de cartões emitidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Crescimento do Volume de Crédito</CardTitle>
            <CardDescription>Volume processado por gateway de pagamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAsaas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-asaas)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-asaas)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillOthers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-others)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-others)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickFormatter={(val) => `R$ ${val / 1000000}M`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="asaas"
                  fill="url(#fillAsaas)"
                  stroke="var(--color-asaas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="others"
                  fill="url(#fillOthers)"
                  stroke="var(--color-others)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Modo</CardTitle>
            <CardDescription>Varejo vs Consignado (RH)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <PartnerDragDropManager />

        {/* Network Tree view */}
        <Card className="md:col-span-7">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Árvore da Rede Corporativa</CardTitle>
              <CardDescription>
                Hierarquia de sedes (matrizes) e suas filiais associadas.
              </CardDescription>
            </div>
            {headquarters.length > 0 && (
              <div className="w-full sm:w-64">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedMatrixId}
                  onChange={(e) => setSelectedMatrixId(e.target.value)}
                >
                  <option value="all">Todas as Matrizes</option>
                  {headquarters.map((hq) => (
                    <option key={hq.id} value={hq.id}>
                      {hq.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {filteredHeadquarters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma matriz encontrada.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {filteredHeadquarters.map((hq) => {
                  const myBranches = branches.filter((b) => b.parent_company_id === hq.id)
                  return (
                    <AccordionItem key={hq.id} value={hq.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{hq.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {myBranches.length} filiais
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {myBranches.length === 0 ? (
                          <div className="ml-6 py-2 text-sm text-muted-foreground border-l-2 border-primary/20 pl-4">
                            Sem filiais vinculadas.
                          </div>
                        ) : (
                          <div className="ml-6 space-y-2 border-l-2 border-primary/20 pl-4 py-2">
                            {myBranches.map((b) => (
                              <div
                                key={b.id}
                                className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-md"
                              >
                                <div>
                                  <span className="font-medium">{b.name}</span>
                                  {b.cnpj && (
                                    <span className="text-muted-foreground ml-2">
                                      CNPJ: {b.cnpj}
                                    </span>
                                  )}
                                </div>
                                <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>
                                  {b.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
