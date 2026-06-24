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
import { VirtualCard } from '@/components/VirtualCard'

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
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="flex justify-center w-full max-w-sm mx-auto">
            <VirtualCard
              cardNumber={holder.card_number}
              holderName={user.name}
              expiry={holder.expiry}
            />
          </div>

          <div className="space-y-6">
            <Card className="bg-card shadow-lg border-primary/20">
              <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-lg font-medium text-muted-foreground">
                  Resumo de Limites
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  R$ {Math.max(0, holder.total_limit - holder.used_limit).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Limite Disponível</div>

                <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Limite Total:</div>
                  <div className="font-semibold">R$ {holder.total_limit.toFixed(2)}</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Status do Cartão:</div>
                  <Badge
                    variant={holder.status === 'active' ? 'default' : 'destructive'}
                    className="uppercase tracking-wider"
                  >
                    {holder.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
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
