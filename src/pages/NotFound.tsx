import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-2xl text-gray-600">Ops! Página não encontrada</p>
        <p className="text-gray-500 max-w-md mx-auto pb-4">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild>
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
