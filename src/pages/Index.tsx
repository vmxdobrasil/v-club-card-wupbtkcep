import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import heroImage from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-c80d5.jpeg'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="font-black text-2xl text-blue-900 tracking-tighter">V CLUB CARD</div>
        <nav className="flex gap-4">
          <Link to="/master">
            <Button variant="ghost" className="font-semibold text-slate-600 hover:text-blue-900">
              Painel Master
            </Button>
          </Link>
          <Link to="/company">
            <Button variant="ghost" className="font-semibold text-slate-600 hover:text-blue-900">
              Painel Empresa
            </Button>
          </Link>
          <Link to="/holder">
            <Button variant="ghost" className="font-semibold text-slate-600 hover:text-blue-900">
              Painel Portador
            </Button>
          </Link>
          <Link to="/partner">
            <Button variant="ghost" className="font-semibold text-slate-600 hover:text-blue-900">
              Painel Parceiro
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-20 px-4 text-center">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              A Plataforma Definitiva para Cartões Private Label
            </h1>
            <p className="text-lg text-slate-600">
              Transforme a gestão de benefícios, fidelize clientes e aumente o faturamento com o
              nosso sistema co-branded completo. Totalmente configurável e flexível para o seu
              negócio.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/master">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Começar Agora
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-semibold border-slate-300">
                Fale com um Consultor
              </Button>
            </div>
          </div>
          <div className="flex justify-center relative">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-3xl opacity-20 animate-pulse" />
            <img
              src={heroImage}
              alt="Modelo V Club Card"
              className="relative rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 w-full max-w-md border-4 border-white"
            />
          </div>
        </div>
      </main>

      <footer className="py-8 mt-12 text-center text-slate-500 text-sm border-t bg-white">
        &copy; {new Date().getFullYear()} V Club Card. Todos os direitos reservados.
      </footer>
    </div>
  )
}
