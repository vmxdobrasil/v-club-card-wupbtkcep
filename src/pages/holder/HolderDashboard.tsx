import { useAuth } from '@/hooks/use-auth'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, AlertCircle } from 'lucide-react'

export default function HolderDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user?.name || 'Cardholder'}!
        </h1>
        <p className="text-muted-foreground">Manage your V CLUB Card and view your limits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Virtual Card Display */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
          <img
            src={cardImage}
            alt="V Club Virtual Card"
            className="w-full max-w-[320px] h-auto object-contain rounded-xl shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Limit</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ 2.450,00</div>
            <p className="text-xs text-muted-foreground mt-1">Total limit: R$ 5.000,00</p>
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[51%]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Card Status</CardTitle>
            <AlertCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Your card is ready to use</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
