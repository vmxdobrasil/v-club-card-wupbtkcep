import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Store, TrendingUp, CheckCircle2, History, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { getTransactions } from '@/services/transactions'
import { useRealtime } from '@/hooks/use-realtime'

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const txs = await getTransactions()
      setTransactions(txs.filter((t) => t.partner_id === user?.id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('transactions', () => {
    loadData()
  })

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  const totalToday = transactions.reduce((acc, t) => acc + (t.type === 'debit' ? t.amount : 0), 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground">Parceiro V Club - Recebedor</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Cobrar com V Club
            </CardTitle>
            <CardDescription>Gere um QR Code para o cliente escanear no app dele.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label>Valor da Venda (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                className="text-2xl h-14 font-bold text-primary"
              />
            </div>
            <div className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
              <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm border flex items-center justify-center relative">
                {/* Mock QR Code Pattern */}
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(black 0% 25%, transparent 25% 50%)',
                    backgroundSize: '12px 12px',
                    opacity: 0.8,
                  }}
                ></div>
                <div className="absolute inset-0 m-auto w-10 h-10 bg-white flex items-center justify-center rounded">
                  <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-primary-foreground italic text-xs">
                    V
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Aguardando leitura do cliente...</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">
              Gerar Novo QR Code
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas Hoje (V Club)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">R$ {totalToday.toFixed(2).replace('.', ',')}</div>
              <p className="text-sm text-emerald-500 flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" /> atualizado em tempo real
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5" />
                Vendas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.expand?.holder_id?.expand?.user_id?.name || 'Cliente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {tx.amount.toFixed(2).replace('.', ',')}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">Nenhuma venda hoje.</p>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary">
                Ver Extrato Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
