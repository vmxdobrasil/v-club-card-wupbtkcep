import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">V Club Card</h1>
          <p className="text-lg text-slate-600">
            Plataforma de cartão private label e co-branded para empresas.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/master" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              Acesso Administrador
            </Button>
          </Link>
          <Link to="/company" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full">
              Acesso Empresa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
