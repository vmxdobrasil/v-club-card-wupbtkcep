import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import cardImage from '@/assets/whatsapp-image-2026-05-29-at-08.18.14-1-9a666.jpeg'

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link to="/" className="flex items-center justify-center">
          <img src={cardImage} alt="V Club Card" className="h-10 w-auto object-contain rounded" />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link to="/company" className="text-sm font-medium hover:text-primary transition-colors">
            Empresa
          </Link>
          <Link to="/partner" className="text-sm font-medium hover:text-primary transition-colors">
            Parceiros
          </Link>
          <Button asChild variant="default" size="sm">
            <Link to="/master">Entrar</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col">
        <section className="w-full flex-1 py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background flex items-center">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Faz Mais Por Você
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Plataforma de cartão private label e co-branded para empresas. Revolucione os
                    benefícios dos seus colaboradores com a nossa solução inteligente e integrada.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to="/master">Entrar na Plataforma</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link to="/company">Saiba Mais</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8 lg:p-0 animate-fade-in">
                <img
                  src={cardImage}
                  alt="V Club Card"
                  className="aspect-[1.58] w-full max-w-[500px] overflow-hidden rounded-2xl object-cover shadow-2xl transition-transform hover:scale-105 duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          © 2026 V Club Card. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            to="#"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
          >
            Termos de Serviço
          </Link>
          <Link
            to="#"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
          >
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  )
}

export default Index
