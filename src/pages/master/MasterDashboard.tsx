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
import { Building2, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
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

const recentCompanies = [
  { id: '1', name: 'Tech Solutions LTDA', mode: 'Consignado', bin: '636943.10', status: 'Ativo' },
  { id: '2', name: 'Farmácia Saúde+', mode: 'Varejo', bin: '636943.11', status: 'Ativo' },
  { id: '3', name: 'Supermercados Dia', mode: 'Varejo', bin: '636943.12', status: 'Em Análise' },
  { id: '4', name: 'Indústria Metálica SA', mode: 'Consignado', bin: '636943.13', status: 'Ativo' },
]

export default function MasterDashboard() {
  const chartConfig = {
    asaas: { label: 'Asaas Gateway', color: 'hsl(var(--primary))' },
    others: { label: 'Outros', color: 'hsl(var(--chart-2))' },
  }

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
            <div className="text-2xl font-bold">R$ 12.5M</div>
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
            <div className="text-2xl font-bold">R$ 156.250</div>
            <p className="text-xs text-muted-foreground mt-1">Média de 0.8% por transação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">+12 novas este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Emitidos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.231</div>
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
              {recentCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.mode}</TableCell>
                  <TableCell className="font-mono">{company.bin}.xxxx</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === 'Ativo' ? 'default' : 'secondary'}
                      className={
                        company.status === 'Ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
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
