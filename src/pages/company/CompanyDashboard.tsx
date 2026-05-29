import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingCart, DollarSign } from 'lucide-react'

export default function CompanyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-muted-foreground">Manage your cardholders and view transactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden border-none shadow-xl relative">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 opacity-90 hidden md:block">
            <img
              src={cardImage}
              alt="V CLUB Card"
              className="w-full h-auto object-contain drop-shadow-2xl rounded-lg transform -rotate-6 hover:rotate-0 transition-transform duration-500"
            />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl">Welcome to V CLUB</CardTitle>
          </CardHeader>
          <CardContent className="md:w-2/3 relative z-10">
            <p className="text-slate-300 text-lg">
              Your co-branded card program is active. Start issuing cards to your customers today
              and grow your business.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cardholders</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Volume</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 124.500</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
