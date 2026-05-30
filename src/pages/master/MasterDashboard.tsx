import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Building2, Users, Package, ShoppingBag } from 'lucide-react'

const MasterDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Principal</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.name || 'Administrador'}. Aqui está o resumo do seu sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <Link to="/companies" className="text-xs text-blue-600 hover:underline">
              Ver todas as empresas
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <Link to="/partners" className="text-xs text-blue-600 hover:underline">
              Ver todos os parceiros
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catálogos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <Link to="/catalogos" className="text-xs text-blue-600 hover:underline">
              Ver catálogos
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <Link to="/products" className="text-xs text-blue-600 hover:underline">
              Ver produtos
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MasterDashboard
