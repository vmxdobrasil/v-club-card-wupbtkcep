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
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalSales, setTotalSales] = useState(0)

  const loadData = async () => {
    if (!user) return
    try {
      const txs = await pb.collection('transactions').getList(1, 50, {
        filter: `partner_id="${user.id}" && status="approved"`,
        sort: '-created',
      })
      setTransactions(txs.items)
      const sum = txs.items.reduce((acc, curr) => acc + curr.amount, 0)
      setTotalSales(sum)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('transactions', loadData)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard do Parceiro</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Vendas Aprovadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhuma venda realizada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(tx.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{tx.gateway_ref || tx.id}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        R$ {tx.amount.toFixed(2)}
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
