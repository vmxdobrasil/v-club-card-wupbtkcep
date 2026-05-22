import { useEffect, useState, useRef, useMemo } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Upload,
  CreditCard,
  Loader2,
  Search,
  Wallet,
  PiggyBank,
  FileSpreadsheet,
} from 'lucide-react'
import { getCompanyCardHolders, updateCardHolder } from '@/services/card_holders'
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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [importingCsv, setImportingCsv] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const [editingEmp, setEditingEmp] = useState<any>(null)
  const [editTotalLimit, setEditTotalLimit] = useState('')
  const [editMargin, setEditMargin] = useState('')

  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth().toString())
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear().toString())
  const [payrollTransactions, setPayrollTransactions] = useState<any[]>([])
  const [loadingPayroll, setLoadingPayroll] = useState(false)

  const loadData = async (compId: string) => {
    try {
      const emps = await getCompanyCardHolders(compId)
      setEmployees(emps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadPayrollTransactions = async () => {
    if (!company) return
    setLoadingPayroll(true)
    try {
      const start = new Date(Number(payrollYear), Number(payrollMonth), 1)
      const end = new Date(Number(payrollYear), Number(payrollMonth) + 1, 0, 23, 59, 59, 999)

      const txs = await getCompanyTransactions(
        company.id,
        `status="approved" && created >= "${start.toISOString().replace('T', ' ')}" && created <= "${end.toISOString().replace('T', ' ')}"`,
      )
      setPayrollTransactions(txs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPayroll(false)
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

  useEffect(() => {
    if (company) {
      loadPayrollTransactions()
    }
  }, [company, payrollMonth, payrollYear])

  useRealtime('card_holders', () => {
    if (company) loadData(company.id)
  })

  const totalActive = employees.filter((e) => e.status === 'active').length
  const totalUsed = employees.reduce((acc, e) => acc + (e.used_limit || 0), 0)
  const totalAvailable = employees.reduce((acc, e) => {
    const margin = e.max_consigned_margin || e.total_limit || 0
    return acc + Math.max(0, margin - (e.used_limit || 0))
  }, 0)

  const payrollSummary = useMemo(() => {
    const map: Record<string, any> = {}
    payrollTransactions.forEach((tx) => {
      const empId = tx.expand?.holder_id?.expand?.user_id?.id
      if (!empId) return
      if (!map[empId]) {
        map[empId] = {
          name: tx.expand?.holder_id?.expand?.user_id?.name || 'Desconhecido',
          cardNumber: tx.expand?.holder_id?.card_number || 'S/N',
          totalAmount: 0,
        }
      }
      if (tx.type === 'debit') {
        map[empId].totalAmount += tx.amount
      } else {
        map[empId].totalAmount -= tx.amount
      }
    })
    return Object.values(map)
      .filter((m) => m.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }, [payrollTransactions])

  const openEdit = (emp: any) => {
    setEditingEmp(emp)
    setEditTotalLimit(emp.total_limit?.toString() || '0')
    setEditMargin(emp.max_consigned_margin?.toString() || '0')
  }

  const handleSaveEmp = async () => {
    try {
      await updateCardHolder(editingEmp.id, {
        total_limit: Number(editTotalLimit),
        max_consigned_margin: Number(editMargin),
      })
      toast({ title: 'Sucesso', description: 'Limites do colaborador atualizados.' })
      setEditingEmp(null)
      loadData(company.id)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar.' })
    }
  }

  const toggleStatus = async (emp: any) => {
    try {
      const newStatus = emp.status === 'active' ? 'blocked' : 'active'
      await updateCardHolder(emp.id, { status: newStatus })
      toast({
        title: 'Sucesso',
        description: `Cartão alterado para ${newStatus === 'active' ? 'Ativo' : 'Bloqueado'}.`,
      })
      loadData(company.id)
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao alterar status.' })
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImportingCsv(true)
      const text = await file.text()
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) throw new Error('Arquivo vazio')

      const headers = lines[0]
        .toLowerCase()
        .split(',')
        .map((h) => h.trim())
      const nameIdx = headers.indexOf('name')
      const emailIdx = headers.indexOf('email')
      const limitIdx = headers.indexOf('total_limit')
      const marginIdx = headers.indexOf('max_consigned_margin')

      if (nameIdx === -1 || emailIdx === -1) {
        toast({
          variant: 'destructive',
          title: 'Formato Inválido',
          description: 'O CSV precisa ter "name" e "email".',
        })
        return
      }

      let success = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim())
        const name = cols[nameIdx]
        const email = cols[emailIdx]
        if (!name || !email) continue

        const total_limit = limitIdx !== -1 ? Number(cols[limitIdx]) || 0 : 0
        const max_consigned_margin = marginIdx !== -1 ? Number(cols[marginIdx]) || 0 : 0

        try {
          let userId
          try {
            const existingUser = await pb.collection('users').getFirstListItem(`email="${email}"`)
            userId = existingUser.id
          } catch (_) {
            const newUser = await pb.collection('users').create({
              email,
              password: 'VClubPassword123!',
              passwordConfirm: 'VClubPassword123!',
              name,
              role: 'holder',
            })
            userId = newUser.id
          }

          try {
            await pb
              .collection('card_holders')
              .getFirstListItem(`user_id="${userId}" && company_id="${company.id}"`)
            errors++
          } catch (_) {
            await pb.collection('card_holders').create({
              user_id: userId,
              company_id: company.id,
              total_limit,
              max_consigned_margin,
              used_limit: 0,
              status: 'active',
              card_number:
                '4000' + Math.floor(100000000000 + Math.random() * 900000000000).toString(),
              cvv: '123',
              expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString(),
            })
            success++
          }
        } catch (err) {
          errors++
        }
      }

      toast({
        title: 'Importação Concluída',
        description: `${success} importados, ${errors} já existentes/erros.`,
      })
      loadData(company.id)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao processar arquivo.' })
    } finally {
      setImportingCsv(false)
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  const handleDownloadPayroll = () => {
    let csv = 'Nome,Cartão,Valor Desconto\n'
    payrollSummary.forEach((row) => {
      csv += `"${row.name}","${row.cardNumber}",${row.totalAmount.toFixed(2)}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fechamento_folha_${payrollMonth}_${payrollYear}.csv`
    a.click()
    a.remove()
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel RH - {company.name}</h1>
          <p className="text-muted-foreground">Gestão de Benefícios e Colaboradores</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between font-medium">
              Cartões Ativos <CreditCard className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActive}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between font-medium">
              Total Consumido <Wallet className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              R$ {totalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saldo utilizado atual</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between font-medium">
              Margem Disponível <PiggyBank className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              R$ {totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Soma de saldos livres</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Diretório de Colaboradores</TabsTrigger>
          <TabsTrigger value="payroll">Fechamento de Folha</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle>Gestão de Limites e Status</CardTitle>
                <CardDescription>Acompanhe e ajuste as margens dos colaboradores.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou cartão..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => csvInputRef.current?.click()}
                  disabled={importingCsv}
                  className="shrink-0"
                >
                  {importingCsv ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Importar CSV
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  ref={csvInputRef}
                  className="hidden"
                  onChange={handleCSVImport}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Cartão / Status</TableHead>
                      <TableHead className="text-right">Limite Total</TableHead>
                      <TableHead className="text-right">Margem (Máx)</TableHead>
                      <TableHead className="text-right">Utilizado</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => {
                      const margin = emp.max_consigned_margin || emp.total_limit || 0
                      const used = emp.used_limit || 0
                      const usage = margin > 0 ? (used / margin) * 100 : 0
                      const maskedCard = emp.card_number
                        ? `**** **** **** ${emp.card_number.slice(-4)}`
                        : 'Sem cartão'
                      const isActive = emp.status === 'active'

                      return (
                        <TableRow
                          key={emp.id}
                          className={!isActive ? 'opacity-60 bg-muted/20' : ''}
                        >
                          <TableCell className="font-medium">
                            {emp.expand?.user_id?.name || 'Sem nome'}
                            <div className="text-xs text-muted-foreground font-normal">
                              {emp.expand?.user_id?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{maskedCard}</div>
                            <Badge
                              variant={isActive ? 'default' : 'secondary'}
                              className={
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                  : 'mt-1'
                              }
                            >
                              {isActive
                                ? 'Ativo'
                                : emp.status === 'blocked'
                                  ? 'Bloqueado'
                                  : 'Cancelado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            R${' '}
                            {(emp.total_limit || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            R$ {margin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-medium">
                                R$ {used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Progress
                                value={usage}
                                className={`h-1.5 w-16 ${usage > 90 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(emp)}>
                                Editar
                              </Button>
                              <div
                                className="flex items-center space-x-2"
                                title={isActive ? 'Bloquear' : 'Ativar'}
                              >
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={() => toggleStatus(emp)}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          Nenhum colaborador encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="shadow-sm border-t-4 border-t-secondary">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle>Fechamento de Folha</CardTitle>
                <CardDescription>
                  Gere o relatório de descontos consolidados por período.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={payrollMonth} onValueChange={setPayrollMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const d = new Date(2000, i, 1)
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          {d.toLocaleString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Select value={payrollYear} onValueChange={setPayrollYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="default"
                  onClick={handleDownloadPayroll}
                  disabled={payrollSummary.length === 0 || loadingPayroll}
                  className="ml-2"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPayroll ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Cartão</TableHead>
                        <TableHead className="text-right">Total a Descontar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollSummary.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="text-muted-foreground">{row.cardNumber}</TableCell>
                          <TableCell className="text-right font-bold text-destructive">
                            R${' '}
                            {row.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {payrollSummary.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-10"
                          >
                            Nenhuma transação aprovada no período selecionado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingEmp} onOpenChange={(open) => !open && setEditingEmp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Limites</DialogTitle>
            <DialogDescription>
              Ajuste o limite total e a margem consignável máxima para{' '}
              {editingEmp?.expand?.user_id?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="total_limit">Limite Total do Cartão (R$)</Label>
              <Input
                id="total_limit"
                type="number"
                value={editTotalLimit}
                onChange={(e) => setEditTotalLimit(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="margin">Margem Consignável (R$)</Label>
              <Input
                id="margin"
                type="number"
                value={editMargin}
                onChange={(e) => setEditMargin(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Valor máximo que pode ser descontado em folha.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmp(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEmp}>Salvar Limites</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
