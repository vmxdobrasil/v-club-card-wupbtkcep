import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MasterDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Master Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Bem-vindo ao painel administrativo Master. Gerencie empresas, catálogos e
              configurações da plataforma usando o menu de navegação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
