import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, Users } from 'lucide-react'

export default function MasterDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-2 bg-slate-900 border-none text-white overflow-hidden relative shadow-lg">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none md:flex justify-end hidden">
            <img
              src={cardImage}
              alt="V CLUB Branding"
              className="h-full w-auto object-cover opacity-80 mix-blend-screen transform translate-x-12 scale-125"
            />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl">V CLUB Platform</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-green-400">System Active</div>
            <p className="text-slate-300 mt-2 max-w-sm">
              All services are running smoothly. View your KPIs below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
