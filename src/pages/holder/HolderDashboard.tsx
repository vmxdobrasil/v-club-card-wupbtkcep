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

export default function HolderDashboard() {
  const { user } = useAuth()
  const [holder, setHolder] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      const record = await pb.collection('card_holders').getFirstListItem(`user_id="${user.id}"`)
      setHolder(record)

      const txs = await pb.collection('transactions').getList(1, 20, {
        filter: `holder_id="${record.id}"`,
        sort: '-created',
      })
      setTransactions(txs.items)
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
      <h1 className="text-2xl font-bold">Meu Cartão</h1>

      {holder && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Limite Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {Math.max(0, holder.total_limit - holder.used_limit).toFixed(2)}
              </div>
              <div className="text-sm opacity-80 mt-2">
                Limite Total: R$ {holder.total_limit.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status do Cartão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={holder.status === 'active' ? 'default' : 'destructive'}
                className="mt-2 text-lg px-4 py-1 uppercase"
              >
                {holder.status}
              </Badge>
              <div className="text-sm text-muted-foreground mt-4 font-mono">
                **** **** **** {holder.card_number?.slice(-4) || 'XXXX'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma transação ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(tx.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize whitespace-nowrap">
                        {tx.type === 'debit' ? 'Débito' : 'Crédito'}
                      </TableCell>
                      <TableCell
                        className={`whitespace-nowrap font-medium ${tx.type === 'debit' ? 'text-destructive' : 'text-success'}`}
                      >
                        {tx.type === 'debit' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
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
