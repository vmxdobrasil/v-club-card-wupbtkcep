import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CreditCard, ShieldCheck, Zap, Building, ChevronRight } from 'lucide-react'

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 md:pt-24 lg:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
                A evolução do seu <span className="text-primary">cartão de benefícios</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0">
                Plataforma completa de cartões Private Label e Co-branded para a sua empresa.
                Ofereça crédito, benefícios e muito mais com a tecnologia V Club Card.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  <Link to="/master">
                    Acessar Plataforma <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base h-12 px-8"
                >
                  <Link to="/catalog">Ver Catálogo</Link>
                </Button>
              </div>
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 font-medium">
                <ShieldCheck className="size-5 text-green-500" />
                <span>BIN Homologado: 636943</span>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md lg:max-w-none relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
              <img
                src="/whatsapp-image.jpeg"
                alt="V Club Card - Cartão Oficial"
                className="relative z-10 w-full rounded-2xl shadow-2xl object-cover aspect-[4/3] border border-slate-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://img.usecurling.com/p/600/400?q=credit%20card&color=blue'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Por que escolher o V Club Card?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Nossa plataforma foi desenvolvida para atender desde pequenos negócios a grandes
              corporações, entregando uma gestão financeira e de benefícios completa.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Building className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestão Corporativa</h3>
              <p className="text-slate-600">
                Painel administrativo completo para controle de limites, emissão de cartões e gestão
                de usuários.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <CreditCard className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Private Label & Co-branded</h3>
              <p className="text-slate-600">
                Cartões personalizados com a sua marca, integrados a um robusto sistema de
                processamento.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integração Rápida</h3>
              <p className="text-slate-600">
                APIs modernas e webhooks para conectar o V Club Card ao seu ERP ou sistema de folha
                de pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para revolucionar os benefícios da sua empresa?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
            A Vmx do Brasil Administradora de Cartões e Benefícios Ltda garante toda a
            infraestrutura e segurança que seu negócio precisa para escalar.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-primary font-semibold h-12 px-8"
          >
            <Link to="/master">Falar com um Consultor</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Index
