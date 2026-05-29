import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import cardImg from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-b53dc.jpeg'

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold tracking-tighter text-blue-500 flex items-center gap-2">
          V CLUB <span className="text-red-500 text-lg">CARD</span>
        </h1>
        <Link to="/companies">
          <Button variant="outline" className="text-slate-900 border-white hover:bg-white/90">
            Acessar Painel
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 max-w-7xl mx-auto gap-16">
        <div className="flex-1 space-y-8 z-10">
          <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Faz mais por <span className="text-red-500">Você.</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
            Plataforma definitiva de cartão private label e co-branded para sua empresa. Benefícios
            exclusivos, gestão simplificada e vantagens reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/companies">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 w-full sm:w-auto font-semibold shadow-lg shadow-blue-900/50">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full max-w-lg perspective-1000">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-red-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <img
              src={cardImg}
              alt="V Club Card"
              className="relative w-full h-auto rounded-3xl shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out border border-white/10"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
