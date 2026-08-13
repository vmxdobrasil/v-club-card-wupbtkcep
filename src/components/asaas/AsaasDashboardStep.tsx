import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  DollarSign,
  TrendingUp,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Copy,
  Check,
  Ban,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  History,
  Filter,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { cancelAsaasCharge } from '@/services/asaas'

interface AsaasTransaction {
  id: string
  customer_name?: string
  customer_cpf_cnpj?: string
  customer_email?: string
  amount: number
  status: string
  billing_type?: string
  due_date?: string
  gateway_ref?: string
  payment_link?: string
  description?: string
  created: string
  updated: string
}

export function AsaasDashboardStep() {
  const [transactions, setTransactions] = useState<AsaasTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalTotalItems] = useState(0)
  const pageSize = 8

  const { toast } = useToast()

  useEffect(() => {
    loadTransactions()
  }, [currentPage, statusFilter])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      let filter = 'gateway_ref != ""'
      if (statusFilter !== 'all') {
        filter += ` && status = "${statusFilter}"`
      }

      const resultList = await pb.collection('transactions').getList(currentPage, pageSize, {
        filter,
        sort: '-created',
      })

      setTransactions(resultList.items as unknown as AsaasTransaction[])
      setTotalPages(resultList.totalPages)
      setTotalTotalItems(resultList.totalItems)
    } catch (err: any) {
      console.error('Error loading Asaas transactions:', err)
      toast({
        variant: 'destructive',
        title: 'Erro ao Carregar Histórico',
        description: err.message || 'Falha ao buscar transações do banco de dados.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCharge = async (tx: AsaasTransaction) => {
    if (!confirm(`Tem certeza que deseja cancelar a cobrança de R$ ${tx.amount.toFixed(2)}?`)) {
      return
    }

    setCancelingId(tx.id)
    try {
      await cancelAsaasCharge(tx.id, tx.gateway_ref)
      toast({
        title: 'Cobrança Cancelada',
        description: 'A cobrança foi anulada no Asaas e seu status atualizado.',
      })
      loadTransactions()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Cancelar',
        description: err.message || 'Falha ao cancelar cobrança no gateway.',
      })
    } finally {
      setCancelingId(null)
    }
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast({
      title: 'Link Copiado!',
      description: 'O link de pagamento foi copiado com sucesso.',
    })
    setTimeout(() => setCopiedId(null), 3000)
  }

  // Filter client-side by name / cpf
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const name = (tx.customer_name || '').toLowerCase()
    const cpf = (tx.customer_cpf_cnpj || '').toLowerCase()
    const ref = (tx.gateway_ref || '').toLowerCase()
    return name.includes(term) || cpf.includes(term) || ref.includes(term)
  })

  // Summary Metrics calculations
  const totalAmountReceived = transactions
    .filter((t) => t.status === 'approved')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const totalAmountPending = transactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const pendingCount = transactions.filter((t) => t.status === 'pending').length
  const canceledCount = transactions.filter(
    (t) => t.status === 'rejected' || t.status === 'canceled',
  ).length

  return (
    <div className="space-y-8">
      {/* Cards de Resumo / KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recebido */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-blue-950 text-white">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Total Confirmado/Recebido
            </CardTitle>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-white">
              R$ {totalAmountReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-200 mt-1">Cobranças aprovadas via Asaas</p>
          </CardContent>
        </Card>

        {/* Total Pendente */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aguardando Pagamento
            </CardTitle>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-slate-900">
              R$ {totalAmountPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">{pendingCount} cobrança(s) pendente(s)</p>
          </CardContent>
        </Card>

        {/* Total Registrado */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Cobranças
            </CardTitle>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-slate-900">{totalItems}</div>
            <p className="text-xs text-slate-500 mt-1">Registradas no Asaas</p>
          </CardContent>
        </Card>

        {/* Canceladas */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Canceladas / Extornadas
            </CardTitle>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <XCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-slate-900">{canceledCount}</div>
            <p className="text-xs text-slate-500 mt-1">Cobranças anuladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg text-white">
                <History className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  Etapa 03 — Histórico e Gestão de Cobranças
                </CardTitle>
                <p className="text-blue-100 text-xs mt-0.5">
                  Acompanhe em tempo real o status, acesse os links e gerencie cobranças emitidas
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadTransactions}
              disabled={isLoading}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-semibold"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Tabela
            </Button>
          </div>
        </CardHeader>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por cliente, CPF ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-slate-300 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="h-10 w-full sm:w-48 bg-white border-slate-300">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Aguardando Pagamento</SelectItem>
                <SelectItem value="approved">Confirmado / Pago</SelectItem>
                <SelectItem value="rejected">Cancelado / Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="font-medium text-sm">Carregando cobranças do Asaas...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">Nenhuma cobrança encontrada.</p>
              <p className="text-xs text-slate-500 mt-1">
                Tente ajustar os filtros de busca ou crie uma nova cobrança.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Cliente / Sacado</th>
                  <th className="p-4">Valor (R$)</th>
                  <th className="p-4">Forma</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {new Date(tx.created).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {tx.customer_name || 'Cliente Asaas'}
                      </div>
                      {tx.customer_cpf_cnpj && (
                        <div className="text-xs text-slate-500 font-mono">
                          {tx.customer_cpf_cnpj}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900 text-base">
                      R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white font-mono text-xs">
                        {tx.billing_type || 'PIX'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {tx.due_date ? new Date(tx.due_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="p-4">
                      {tx.status === 'approved' ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Pago / Confirmado
                        </Badge>
                      ) : tx.status === 'pending' ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                          Pendente
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Cancelado</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {tx.payment_link && tx.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(tx.payment_link!, tx.id)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                            title="Copiar Link de Pagamento"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-blue-600" />
                            )}
                          </Button>
                          <a href={tx.payment_link} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 text-slate-700"
                              title="Abrir Link"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-600" />
                            </Button>
                          </a>
                        </>
                      )}

                      {tx.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelCharge(tx)}
                          disabled={cancelingId === tx.id}
                          title="Cancelar Cobrança no Asaas"
                        >
                          {cancelingId === tx.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems}{' '}
              registros)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
