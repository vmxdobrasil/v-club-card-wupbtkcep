import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">V Club Card</h1>
        <p className="text-slate-500">
          Selecione seu painel de acesso para gerenciar produtos e catálogos.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" className="w-full justify-center">
            <Link to="/master">Painel Administrativo (Master)</Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center">
            <Link to="/company">Painel da Empresa (Cliente)</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
