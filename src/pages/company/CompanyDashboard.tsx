import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ holders: 0, transactions: 0 })
  const [recentTx, setRecentTx] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      const company = await pb.collection('companies').getFirstListItem(`owner_id="${user.id}"`)
      const [holders, txs] = await Promise.all([
        pb.collection('card_holders').getList(1, 1, { filter: `company_id="${company.id}"` }),
        pb.collection('transactions').getList(1, 10, {
          filter: `company_id="${company.id}"`,
          sort: '-created',
          expand: 'holder_id',
        }),
      ])
      setStats({ holders: holders.totalItems, transactions: txs.totalItems })
      setRecentTx(txs.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('card_holders', loadData)
  useRealtime('transactions', loadData)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard da Empresa</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Titulares Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Titular (CPF)</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTx.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTx.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(tx.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.expand?.holder_id?.cpf || 'Desconhecido'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">R$ {tx.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'}>
                          {tx.type}
                        </Badge>
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
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
