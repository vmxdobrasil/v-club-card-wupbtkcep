import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import useRealtime from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { Loader2, Activity, Users, SplitSquareHorizontal } from 'lucide-react'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [company, setCompany] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({ holders: 0, volume: 0 })
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const companyRes = await pb.collection('companies').getFirstListItem(`owner_id="${user.id}"`)
      setCompany(companyRes)

      const txs = await pb.collection('transactions').getList(1, 50, {
        filter: `company_id="${companyRes.id}"`,
        sort: '-created',
        expand: 'holder_id.user_id',
      })
      setTransactions(txs.items)

      const holdersCount = await pb.collection('card_holders').getList(1, 1, {
        filter: `company_id="${companyRes.id}"`,
        $autoCancel: false,
      })

      const approvedTxs = txs.items.filter((t) => t.status === 'approved' && t.type === 'debit')
      const volume = approvedTxs.reduce((acc, t) => acc + t.amount, 0)

      setStats({
        holders: holdersCount.totalItems,
        volume,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('transactions', (e) => {
    if (company && e.record.company_id === company.id) {
      loadData()
    }
  })

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )

  if (!company)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Empresa não encontrada.</h2>
      </div>
    )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard - {company.name}</h1>
        <p className="text-muted-foreground mt-2">
          Gateway configurado: <Badge variant="outline">{company.gateway_provider}</Badge>
          {company.gateway_provider === 'Asaas' && company.commission_rate && (
            <span className="ml-2 text-sm">
              Taxa Split Plataforma: {(company.commission_rate * 100).toFixed(0)}%
            </span>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume Transacionado</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.volume,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Em transações de débito aprovadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comissões Retidas (Estimativa)</CardTitle>
            <SplitSquareHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.volume * (company.commission_rate || 0.01),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Destinado à plataforma através de Split</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Portador</TableHead>
                <TableHead>Valor Bruto</TableHead>
                <TableHead>Líquido Empresa</TableHead>
                <TableHead>Comissão Split</TableHead>
                <TableHead>Gateway / Ref</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((tx) => {
                const holderName = tx.expand?.holder_id?.expand?.user_id?.name || 'Desconhecido'
                const net = tx.split_data?.net || tx.amount
                const commission = tx.split_data?.commission || 0

                return (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{holderName}</TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(tx.amount)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {tx.type === 'debit'
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(net)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-amber-600">
                      {tx.type === 'debit' && commission > 0
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(commission)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {tx.split_data?.provider === 'Asaas' ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-blue-600">Asaas</span>
                          <span
                            className="text-muted-foreground truncate max-w-[120px]"
                            title={tx.gateway_ref}
                          >
                            {tx.gateway_ref || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Interno</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === 'approved'
                            ? 'default'
                            : tx.status === 'rejected'
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {tx.status === 'approved'
                          ? 'Aprovado'
                          : tx.status === 'rejected'
                            ? 'Rejeitado'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
