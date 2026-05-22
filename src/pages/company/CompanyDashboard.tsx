import { useEffect, useState, useRef } from 'react'
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
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Download,
  Calculator,
  Briefcase,
  CreditCard,
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { getCompanyCardHolders, updateCardHolder } from '@/services/card_holders'
import { getCompanyPayrollBatches, createPayrollBatch } from '@/services/payroll_batches'
import { getCompanyTransactions } from '@/services/transactions'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [company, setCompany] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingMargin, setEditingMargin] = useState<any>(null)
  const [newMargin, setNewMargin] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async (compId: string) => {
    try {
      const [emps, bts] = await Promise.all([
        getCompanyCardHolders(compId),
        getCompanyPayrollBatches(compId),
      ])
      setEmployees(emps)
      setBatches(bts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role !== 'master') {
      pb.collection('companies')
        .getFirstListItem(`owner_id="${user.id}"`)
        .then((comp) => {
          setCompany(comp)
          loadData(comp.id)
        })
        .catch(() => setLoading(false))
    } else if (user && user.role === 'master') {
      pb.collection('companies')
        .getFirstListItem('')
        .then((comp) => {
          setCompany(comp)
          loadData(comp.id)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  useRealtime('card_holders', () => {
    if (company) loadData(company.id)
  })
  useRealtime('payroll_batches', () => {
    if (company) loadData(company.id)
  })

  const handleSaveMargin = async () => {
    try {
      await updateCardHolder(editingMargin.id, { max_consigned_margin: Number(newMargin) })
      toast({ title: 'Sucesso', description: 'Margem atualizada.' })
      setEditingMargin(null)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar margem.' })
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const txs = await getCompanyTransactions(company.id, 'status="approved" && type="debit"')
      const aggregated = txs.reduce((acc: any, tx: any) => {
        const empId = tx.expand?.holder_id?.expand?.user_id?.id
        const empName = tx.expand?.holder_id?.expand?.user_id?.name || 'Unknown'
        if (!acc[empId]) acc[empId] = { id: empId, name: empName, amount: 0 }
        acc[empId].amount += tx.amount
        return acc
      }, {})

      let csv = 'Employee ID,Name,Total Deduction\n'
      Object.values(aggregated).forEach((emp: any) => {
        csv += `${emp.id},"${emp.name}",${emp.amount.toFixed(2)}\n`
      })

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()

      const formData = new FormData()
      formData.append('company_id', company.id)
      formData.append('type', 'export')
      formData.append('status', 'processed')
      formData.append('batch_date', new Date().toISOString().replace('T', ' '))
      formData.append('file_record', blob, `export_${Date.now()}.csv`)

      await createPayrollBatch(formData)
      toast({ title: 'Sucesso', description: 'Arquivo de desconto gerado.' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao gerar arquivo.' })
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImporting(true)
      const formData = new FormData()
      formData.append('company_id', company.id)
      formData.append('type', 'import')
      formData.append('status', 'pending')
      formData.append('batch_date', new Date().toISOString().replace('T', ' '))
      formData.append('file_record', file)

      await createPayrollBatch(formData)
      toast({ title: 'Sucesso', description: 'Arquivo enviado para processamento.' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao enviar arquivo.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  if (!company) return <div className="p-10 text-center">Nenhuma empresa associada encontrada.</div>

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase()
    return (
      (emp.expand?.user_id?.name || '').toLowerCase().includes(term) ||
      (emp.card_number || '').includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel RH - {company.name}</h1>
          <p className="text-muted-foreground">Modo 2: Gestão de Benefício Consignado</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Limite Global Aprovado <Briefcase className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 500.000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Cartões Ativos <CreditCard className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              Simulador <Calculator className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Salário Base" type="number" />
            <Button variant="secondary">Calcular</Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Colaboradores</TabsTrigger>
          <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Limites</CardTitle>
                <CardDescription>Acompanhe e ajuste as margens dos colaboradores.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cartão..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead>Margem Consignada</TableHead>
                    <TableHead>Utilizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => {
                    const margin = emp.max_consigned_margin || emp.total_limit
                    const used = emp.used_limit
                    const usage = margin > 0 ? (used / margin) * 100 : 0
                    const maskedCard = emp.card_number
                      ? `**** **** **** ${emp.card_number.slice(-4)}`
                      : 'Sem cartão'
                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          {emp.expand?.user_id?.name || 'User'}
                        </TableCell>
                        <TableCell>{maskedCard}</TableCell>
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMargin(emp)
                              setNewMargin(margin.toString())
                            }}
                          >
                            Editar Margem
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Nenhum colaborador encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Arquivos (Folha)</CardTitle>
                <CardDescription>
                  Arquivos de desconto gerados e retornos processados.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={exporting}>
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Gerar Desconto
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} disabled={importing}>
                  {importing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Importar Retorno
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{new Date(b.batch_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {b.type === 'export' ? (
                          <Badge variant="outline" className="text-blue-600">
                            <Download className="w-3 h-3 mr-1" /> Exportação
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-purple-600">
                            <Upload className="w-3 h-3 mr-1" /> Importação
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {b.file_record ? (
                          <a
                            href={pb.files.getURL(b, b.file_record)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" /> Download
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {b.status === 'processed' ? (
                          <Badge className="bg-emerald-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Processado
                          </Badge>
                        ) : b.status === 'error' ? (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" /> Erro
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" /> Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {batches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum arquivo processado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingMargin} onOpenChange={(open) => !open && setEditingMargin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Margem Consignável</DialogTitle>
            <DialogDescription>
              Ajuste o limite máximo (margem) para {editingMargin?.expand?.user_id?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="margin">Nova Margem (R$)</Label>
              <Input
                id="margin"
                type="number"
                value={newMargin}
                onChange={(e) => setNewMargin(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMargin(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMargin}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
