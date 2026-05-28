import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import useRealtime from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { CreditCard, Wallet, Receipt, Loader2, ExternalLink } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function HolderDashboard() {
  const { user } = useAuth()
  const [holder, setHolder] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const holderRes = await pb
        .collection('card_holders')
        .getFirstListItem(`user_id="${user.id}"`, {
          expand: 'company_id',
        })
      setHolder(holderRes)

      const txs = await pb.collection('transactions').getList(1, 50, {
        filter: `holder_id="${holderRes.id}"`,
        sort: '-created',
      })
      setTransactions(txs.items)
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
    if (holder && e.record.holder_id === holder.id) {
      loadData()
    }
  })

  useRealtime('card_holders', (e) => {
    if (holder && e.record.id === holder.id) {
      loadData()
    }
  })

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )

  if (!holder)
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Você ainda não possui um cartão vinculado.</p>
          </CardContent>
        </Card>
      </div>
    )

  const availableLimit = holder.total_limit - holder.used_limit

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Meu Cartão</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> V Club Card
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {holder.expand?.company_id?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono tracking-widest mb-4">
              {holder.card_number
                ? holder.card_number.replace(/(.{4})/g, '$1 ').trim()
                : '**** **** **** ****'}
            </div>
            <div className="flex justify-between text-sm">
              <span>
                Validade: {holder.expiry ? format(new Date(holder.expiry), 'MM/yy') : '--/--'}
              </span>
              <span>CVV: {holder.cvv || '***'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Limites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Disponível</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    availableLimit,
                  )}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (availableLimit / holder.total_limit) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">
                Total:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  holder.total_limit,
                )}
              </span>
              <span className="text-muted-foreground">
                Usado:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  holder.used_limit,
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <SimulateTransactionDialog holder={holder} onComplete={loadData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação / Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(new Date(tx.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'}>
                      {tx.type === 'credit' ? 'Crédito' : 'Débito'}
                    </Badge>
                  </TableCell>
                  <TableCell className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'credit' ? '+' : '-'}{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      tx.amount,
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
                  <TableCell>
                    {tx.status === 'pending' && tx.split_data?.payment_url ? (
                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" asChild>
                        <a href={tx.split_data.payment_url} target="_blank" rel="noreferrer">
                          Pagar Fatura <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    ) : tx.gateway_ref ? (
                      <span className="text-xs text-muted-foreground" title={tx.gateway_ref}>
                        Ref: {tx.gateway_ref.split('-')[0]}...
                      </span>
                    ) : (
                      '-'
                    )}
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

function SimulateTransactionDialog({
  holder,
  onComplete,
}: {
  holder: any
  onComplete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await pb.collection('transactions').create({
        holder_id: holder.id,
        company_id: holder.company_id,
        amount: Number(amount),
        type: 'debit',
        status: 'pending',
      })
      toast.success('Transação registrada! Caso utilize Asaas, a cobrança foi gerada com sucesso.')
      setOpen(false)
      setAmount('')
      onComplete()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          Simular Compra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simular Compra</DialogTitle>
          <DialogDescription>
            Crie uma transação de débito para simular a integração com o gateway configurado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSimulate}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Processar Pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
