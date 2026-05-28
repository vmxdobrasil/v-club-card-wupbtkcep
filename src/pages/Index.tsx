import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CreditCard, Building2, Wallet, Bot, Zap, ShieldCheck, ChevronRight } from 'lucide-react'

const features = [
  {
    title: 'Gestão Multi-Tenant',
    description: 'Dashboards especializados para Master Admins, Empresas, Parceiros e Portadores.',
    icon: Building2,
  },
  {
    title: 'Emissão e Ciclo de Vida',
    description:
      'Controle de prefixos BIN, geração de cartões virtuais (Número, CVV, Validade) e status.',
    icon: CreditCard,
  },
  {
    title: 'Motor Dinâmico de Crédito',
    description:
      'Acompanhamento em tempo real de limites totais, limites utilizados e margens consignadas.',
    icon: Zap,
  },
  {
    title: 'Gateway Asaas Integrado',
    description:
      'Automação financeira completa, com faturamento, webhooks e lógica complexa de split.',
    icon: Wallet,
  },
  {
    title: 'Catálogos Inteligentes (IA)',
    description:
      'Busca semântica vetorial e agente de vendas de IA automatizado para interação com clientes.',
    icon: Bot,
  },
  {
    title: 'Segurança e Confiabilidade',
    description:
      'Arquitetura robusta de front-end com UI limpa e componentes projetados para escala.',
    icon: ShieldCheck,
  },
]

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">V Club Card</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#about" className="hover:text-foreground transition-colors">
              A Plataforma
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/master">Login Master</Link>
            </Button>
            <Button asChild>
              <Link to="/company">
                Portal da Empresa <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 border-b overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
              Plataforma Definitiva de Cartões Private Label e Co-Branded
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Capacite sua empresa com emissão de cartões, gestão de crédito dinâmica, split de
              pagamentos automatizado via Asaas e catálogos potencializados por Inteligência
              Artificial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8" asChild>
                <Link to="/master">Conhecer a Plataforma</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base h-12 px-8"
                asChild
              >
                <Link to="/holder">Área do Portador</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Arquitetura de Nível Empresarial</h2>
              <p className="text-muted-foreground text-lg">
                Nossa plataforma foi construída do zero para fornecer todos os recursos necessários
                para a gestão de um ecossistema financeiro moderno.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section id="about" className="py-24 border-t bg-muted/30">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">Controle Total em Cada Nível</h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">0</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-1">Master Admin</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Gestão global de empresas, configurações de BIN, e visibilidade total de
                      transações e comissionamentos em toda a plataforma.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                    <span className="font-bold text-green-600 dark:text-green-400 text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-1">Empresas e Parceiros</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Gestão de portadores de cartão, ajuste de limites de crédito, controle de
                      inventário de produtos e inteligência de vendas.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center shrink-0">
                    <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-1">Portadores de Cartão</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Acesso a cartões virtuais seguros, visualização em tempo real de limites,
                      transações detalhadas e catálogos interativos.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] rounded-xl bg-card border overflow-hidden relative shadow-2xl flex items-center justify-center p-8">
                <div className="w-full max-w-sm bg-background border rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-10 h-6 bg-slate-200 rounded"></div>
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="font-mono text-xl tracking-widest mb-2">6369 43•• •••• ••••</div>
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Portador
                      </div>
                      <div className="font-medium text-sm">JOAO SILVA</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Validade
                      </div>
                      <div className="font-medium text-sm">12/29</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">V Club Card</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
                A plataforma mais avançada para emissão, gestão de crédito e programas de benefícios
                co-branded do mercado brasileiro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Acessos Rápidos</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <Link to="/master" className="hover:text-white transition-colors">
                    Master Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/company" className="hover:text-white transition-colors">
                    Portal da Empresa
                  </Link>
                </li>
                <li>
                  <Link to="/partner" className="hover:text-white transition-colors">
                    Área do Parceiro
                  </Link>
                </li>
                <li>
                  <Link to="/holder" className="hover:text-white transition-colors">
                    Portal do Portador
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Legal e Suporte</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Segurança
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} V Club Card. Desenvolvido para escalar o seu negócio.
          </div>
        </div>
      </footer>
    </div>
  )
}
