import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg'

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-12 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl animate-fade-in-down duration-700">
            Bem-vindo ao <span className="text-primary">V Club Card</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl md:text-2xl animate-fade-in duration-1000 delay-150">
            A plataforma de cartão private label e co-branded feita para potencializar o seu
            negócio.
          </p>
        </div>

        <div className="flex justify-center animate-fade-in-up duration-1000 delay-300">
          <img
            src={cardImage}
            alt="V Club Card"
            className="w-full max-w-[500px] rounded-xl shadow-2xl transform transition-transform duration-500 hover:scale-[1.02] object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in duration-1000 delay-500">
          <Button asChild size="lg" className="w-full sm:w-auto px-8 shadow-md">
            <Link to="/holder">Acessar Conta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 bg-white hover:bg-slate-100"
          >
            <Link to="/master">Painel Master</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
