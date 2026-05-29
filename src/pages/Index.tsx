import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-gray-100">
        <img
          src="/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg"
          alt="V Club Card Logo"
          className="h-10 md:h-12 object-contain"
        />
        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            asChild
            className="hidden sm:inline-flex text-gray-600 hover:text-gray-900"
          >
            <Link to="/master">Login</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/master">Entrar na Plataforma</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Faz Mais Por Você
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Plataforma de cartão private label e co-branded para empresas. Revolucione os
              benefícios dos seus colaboradores com a nossa solução inteligente e integrada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg"
                asChild
              >
                <Link to="/master">Entrar na Plataforma</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-lg border-2"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-105"></div>
            <img
              src="https://img.usecurling.com/p/800/600?q=credit%20cards&color=blue&dpr=2"
              alt="Cartões corporativos"
              className="relative rounded-3xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-12 mt-auto bg-gray-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src="/whatsapp-image-2026-05-29-at-11.30.19-62b47.jpeg"
              alt="V Club Card Logo"
              className="h-8 object-contain grayscale opacity-50 mr-4"
            />
            <p>&copy; {new Date().getFullYear()} V Club Card. Todos os direitos reservados.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="#" className="hover:text-blue-600 transition-colors">
              Termos de Uso
            </Link>
            <Link to="#" className="hover:text-blue-600 transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index
