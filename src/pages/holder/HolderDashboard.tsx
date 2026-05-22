import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard } from '@/components/CreditCard'
import { QrCode, ShoppingCart, Coffee, Activity, ChevronRight, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { getMyCardHolder } from '@/services/card_holders'
import { getMyTransactions } from '@/services/transactions'
import { useRealtime } from '@/hooks/use-realtime'

export default function HolderDashboard() {
  const { user } = useAuth()
  const [holder, setHolder] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const h = await getMyCardHolder(user.id)
      setHolder(h)
      if (h) {
        const txs = await getMyTransactions(h.id)
        setTransactions(txs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('card_holders', (e) => {
    if (e.record.id === holder?.id) {
      setHolder(e.record)
    }
  })

  useRealtime('transactions', (e) => {
    if (e.record.holder_id === holder?.id) {
      loadData()
    }
  })

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  if (!holder)
    return <div className="p-10 text-center text-muted-foreground">Nenhum cartão encontrado.</div>

  const limitTotal = holder.total_limit || 0
  const limitUsed = holder.used_limit || 0
  const limitAvailable = limitTotal - limitUsed
  const percentUsed = limitTotal > 0 ? (limitUsed / limitTotal) * 100 : 0

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Olá, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground text-sm">Sua fatura fecha em 05/06</p>
        </div>
      </div>

      <Carousel className="w-full max-w-sm mx-auto">
        <CarouselContent>
          <CarouselItem>
            <CreditCard
              name={user?.name?.toUpperCase() || 'PORTADOR'}
              number={holder.card_number.replace(/(.{4})/g, '$1 ').trim()}
              expiry={
                holder.expiry
                  ? new Date(holder.expiry).toLocaleDateString('pt-BR', {
                      month: '2-digit',
                      year: '2-digit',
                    })
                  : '12/29'
              }
              cvv={holder.cvv}
              type="virtual"
            />
          </CarouselItem>
          <CarouselItem>
            <CreditCard
              name={user?.name?.toUpperCase() || 'PORTADOR'}
              number={holder.card_number.replace(/(.{4})/g, '$1 ').trim()}
              expiry={
                holder.expiry
                  ? new Date(holder.expiry).toLocaleDateString('pt-BR', {
                      month: '2-digit',
                      year: '2-digit',
                    })
                  : '12/29'
              }
              cvv={holder.cvv}
              type="physical"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <Card className="border-none shadow-elevation bg-card">
        <CardContent className="pt-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Limite Disponível</p>
              <h3 className="text-3xl font-bold text-success tracking-tight">
                R$ {limitAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <Progress
            value={percentUsed}
            className="h-2.5 mb-2 bg-muted rounded-full overflow-hidden [&>div]:bg-primary"
          />
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Utilizado: R$ {limitUsed.toLocaleString()}</span>
            <span>Total: R$ {limitTotal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-20 rounded-2xl flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <QrCode className="h-6 w-6" />
              <span className="text-xs font-semibold">Pagar com QR Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-10 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Apresente no caixa</DialogTitle>
            </DialogHeader>
            <QRCodeDisplay />
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          className="h-20 rounded-2xl flex flex-col items-center justify-center gap-2 border-border shadow-sm bg-card hover:bg-accent"
        >
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="text-xs font-semibold">Rede Parceira</span>
        </Button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-primary">Últimas Transações</h3>
          <Button variant="link" className="text-xs text-primary p-0 h-auto font-semibold">
            Ver todas
          </Button>
        </div>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {tx.expand?.partner_id?.name || 'Compra'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(tx.created).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-500' : ''}`}
                >
                  {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma transação recente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
