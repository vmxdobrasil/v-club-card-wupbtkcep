import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Building2, Users, ArrowRight } from 'lucide-react'

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 lg:px-14 h-20 flex items-center border-b justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <CreditCard className="h-6 w-6" />
          <span>V Club Card</span>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/company">
            <Button variant="ghost">Para Empresas</Button>
          </Link>
          <Link to="/partner">
            <Button variant="ghost">Para Lojistas</Button>
          </Link>
          <Link to="/holder">
            <Button variant="outline">Sou Cliente</Button>
          </Link>
          <Link to="/master">
            <Button>Admin</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900">
              A sua plataforma de <br className="hidden md:inline" />
              <span className="text-primary">Cartões Private Label e Co-branded</span>
            </h1>
            <p className="max-w-[700px] text-lg text-slate-600 md:text-xl">
              Potencialize as vendas e fidelize seus clientes com uma solução completa de cartões de
              crédito sob medida para a sua empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/company">
                <Button size="lg" className="gap-2">
                  Comece Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <Building2 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Para Empresas</CardTitle>
                  <CardDescription>
                    Tenha o seu próprio cartão de crédito, aumente o ticket médio e crie uma nova
                    linha de receita para seu negócio.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/company">
                    <Button variant="outline" className="w-full">
                      Portal da Empresa
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Para Portadores</CardTitle>
                  <CardDescription>
                    Acompanhe seus gastos, acesse sua fatura, consulte seu limite disponível e
                    realize pagamentos com facilidade.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/holder">
                    <Button variant="outline" className="w-full">
                      Acessar Fatura
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Rede Parceira</CardTitle>
                  <CardDescription>
                    Aceite pagamentos com os cartões V Club Card em seu estabelecimento e atraia
                    ainda mais clientes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/partner">
                    <Button variant="outline" className="w-full">
                      Portal do Lojista
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-900 text-slate-300 text-center">
        <p>&copy; {new Date().getFullYear()} V Club Card. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

export default Index
