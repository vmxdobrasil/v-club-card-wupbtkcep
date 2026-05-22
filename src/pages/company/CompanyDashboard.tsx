import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Download,
  Users,
  Calculator,
  Briefcase,
  CreditCard,
  Loader2,
  Store,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'
import { getCardHolders } from '@/services/card_holders'

export default function CompanyDashboard() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCardHolders()
      .then((data) => setEmployees(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel RH - Tech Solutions</h1>
          <p className="text-muted-foreground">Modo 2: Gestão de Benefício Consignado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" /> Importar Folha
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" /> Exportar Descontos
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Limite Global Aprovado
              <Briefcase className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 500.000</div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm opacity-90">
                <span>Utilizado (R$ 125.000)</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="h-2 bg-primary-foreground/20 [&>div]:bg-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Cartões Ativos
              <CreditCard className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {employees.length > 0 ? employees.length : 142}
            </div>
            <p className="text-sm text-muted-foreground mt-2">De 150 colaboradores elegíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Calculadora de Margem
              <Calculator className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Simulação rápida (35%)</p>
            <div className="flex gap-2">
              <Input placeholder="Salário Base" type="number" />
              <Button variant="secondary">Calcular</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Colaboradores</TabsTrigger>
          <TabsTrigger value="network">Rede de Parceiros</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Limites (Margem Consignável)</CardTitle>
              <CardDescription>Baseado no arquivo de folha enviado em 20/05/2026.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Salário Base</TableHead>
                    <TableHead>Margem (35%)</TableHead>
                    <TableHead>Utilizado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const margin = emp.total_limit
                    const used = emp.used_limit
                    const usage = margin > 0 ? (used / margin) * 100 : 0

                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          {emp.expand?.user_id?.name || 'User'}
                        </TableCell>
                        <TableCell>***.***.***-**</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-emerald-600 font-medium">
                          R$ {margin.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">R$ {used.toFixed(2)}</span>
                            <Progress
                              value={usage}
                              className={
                                usage > 90 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={usage > 90 ? 'destructive' : 'default'}
                            className={usage <= 90 ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                          >
                            {usage > 90 ? 'Limite Crítico' : 'Saudável'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Rede Co-branded Adquirida</CardTitle>
              <CardDescription>
                Locais onde os cartões dos seus colaboradores são aceitos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>15 parceiros ativos na sua região.</p>
                <Button variant="outline" className="mt-4">
                  Gerenciar Parceiros
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
