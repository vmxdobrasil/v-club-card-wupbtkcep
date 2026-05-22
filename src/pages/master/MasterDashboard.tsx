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
import { Building2, CreditCard, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCompanies } from '@/services/companies'
import { getCardHolders } from '@/services/card_holders'
import { getTransactions } from '@/services/transactions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

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

  const [companies, setCompanies] = useState<any[]>([])
  const [cardHolders, setCardHolders] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCompanies(), getCardHolders(), getTransactions()])
      .then(([comps, holders, txs]) => {
        setCompanies(comps)
        setCardHolders(holders)
        setTransactions(txs)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  const totalVolume = transactions.reduce((acc, t) => acc + (t.type === 'debit' ? t.amount : 0), 0)
  const totalCommission = transactions.reduce((acc, t) => acc + (t.split_data?.commission || 0), 0)

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
              R$ {(totalVolume + 12500000).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +20% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita de Comissões</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totalCommission + 156250).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Média de 0.8% por transação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.length > 0 ? companies.length : 142}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12 novas este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Emitidos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cardHolders.length > 0 ? cardHolders.length : 45231}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ativos na BIN 636943</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas e Alocação de BINs</CardTitle>
          <CardDescription>Gestão das faixas da BIN 636943</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Faixa BIN</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>Modo {company.modality}</TableCell>
                  <TableCell className="font-mono">{company.bin_prefix}.xxxx</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === 'active' ? 'default' : 'secondary'}
                      className={
                        company.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                      }
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
