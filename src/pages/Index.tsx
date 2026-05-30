import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const Index = () => {
  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          Bem-vindo ao V Club Card
        </h1>
        <p className="text-xl text-gray-600">
          A plataforma completa de cartão private label e co-branded para sua empresa. Gerencie
          parceiros, catálogos, usuários e muito mais em um só lugar.
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <Button asChild size="lg">
            <Link to="/master">Painel Administrativo</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/company">Portal da Empresa</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
