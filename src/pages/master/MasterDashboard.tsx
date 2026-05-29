import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AIChatWidget } from '@/components/AIChatWidget'
import pb from '@/lib/pocketbase/client'

export default function MasterDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    holders: 0,
    products: 0,
  })

  useEffect(() => {
    Promise.all([
      pb.collection('companies').getList(1, 1),
      pb.collection('card_holders').getList(1, 1),
      pb.collection('products').getList(1, 1),
    ])
      .then(([comp, hold, prod]) => {
        setStats({
          companies: comp.totalItems,
          holders: hold.totalItems,
          products: prod.totalItems,
        })
      })
      .catch(console.error)
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">System Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{stats.companies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Card Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{stats.holders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{stats.products}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center text-slate-500">
        <h2 className="text-2xl font-semibold mb-3 text-slate-800">
          Welcome to V Club Card Administration
        </h2>
        <p className="max-w-2xl mx-auto mb-4">
          Use the side menu to seamlessly manage companies, catalogs, card holders, and monitor all
          operational metrics from one place.
        </p>
        <p className="mt-4 text-sm bg-slate-50 inline-block px-4 py-2 rounded-full border">
          💡 <strong>Pro Tip:</strong> Open the AI Assistant at the bottom right corner for system
          prompts and configuration guides.
        </p>
      </div>

      <AIChatWidget />
    </div>
  )
}
