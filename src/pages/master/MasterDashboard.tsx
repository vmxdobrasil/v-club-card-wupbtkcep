import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Users, Key } from 'lucide-react'

export default function MasterDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Master</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema e configurações de integrações.
          </p>
        </div>
        <Button onClick={() => navigate('/master/secrets')} className="gap-2 shadow-sm" size="lg">
          <Plus className="h-5 w-5" />
          Nova Integração
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Total registrado no sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Portadores e parceiros</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Integrações Globais</CardTitle>
            <Key className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Gerenciar</div>
            <Button
              variant="link"
              className="p-0 h-auto text-sm mt-1 text-primary"
              onClick={() => navigate('/master/secrets')}
            >
              Configurar Chaves API (Asaas)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
