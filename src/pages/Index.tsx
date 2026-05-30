import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link to="/" className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">V Club Card</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            to="/master"
            className="text-sm font-medium hover:underline underline-offset-4 mt-2"
          >
            Entrar no Painel
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Sua Plataforma Completa de Cartões
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Ofereça cartões private label e co-branded para seus clientes. Controle limites,
                  faturas e catálogos em um só lugar.
                </p>
              </div>
              <div className="space-x-4 mt-6">
                <Button size="lg" asChild>
                  <Link to="/master">Começar Agora</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/master">Acessar Painel</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rápida Integração</h3>
                <p className="text-muted-foreground">
                  Implemente soluções de crédito para seus clientes em tempo recorde com nossa API
                  nativa.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Segurança Total</h3>
                <p className="text-muted-foreground">
                  Dados criptografados e proteção antifraude para todas as transações da sua base.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Gestão Simplificada</h3>
                <p className="text-muted-foreground">
                  Painel administrativo completo para controlar BINs, limites e emissão de cartões.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 V Club Card. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Termos de Uso
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  )
}
