import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/landing/BrandLogo'
import { LoginModal } from '@/components/landing/LoginModal'
import { LandingCard } from '@/components/LandingCard'
import { LeadForm } from '@/components/landing/LeadForm'
import { ArrowRight, Wallet, Percent, ShieldCheck, Zap, LogIn } from 'lucide-react'

export default function Index() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const scrollToCards = () =>
    document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToForm = () => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-blue-600 transition-colors">
              Benefícios
            </a>
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">
              Como Funciona
            </a>
            <a href="#cards" className="hover:text-blue-600 transition-colors">
              Nossos Cartões
            </a>
          </nav>
          <Button
            onClick={() => setIsLoginOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
          >
            <LogIn className="w-4 h-4 mr-2" /> Acesso à Conta
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-red-950 opacity-90" />
        <div className="container relative mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              O cartão de crédito que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                faz mais por você
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0">
              Tenha acesso a benefícios exclusivos, cashback real e zero anuidade. Transforme sua
              forma de comprar com a solução private label mais completa do mercado.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={scrollToForm}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-14 px-8 text-lg rounded-full"
              >
                Solicitar Meu Cartão
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToCards}
                className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10 h-14 px-8 text-lg rounded-full"
              >
                Conhecer Modelos
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-full">
            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="absolute -inset-10 bg-gradient-to-r from-orange-500 to-red-500 blur-3xl opacity-20 rounded-full" />
              <LandingCard variant="orange" className="transform lg:scale-110 lg:rotate-[-5deg]" />
            </div>
          </div>
        </div>
      </section>

      {/* Cards Showcase */}
      <section id="cards" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Nossos Cartões</h2>
            <p className="text-slate-600 text-lg">
              Escolha o modelo que mais combina com seu estilo e necessidades. Todos com tecnologia
              contactless e segurança avançada.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-8 items-center">
            <div className="space-y-6 text-center">
              <LandingCard variant="orange" />
              <h3 className="text-xl font-bold text-slate-900">Modelo Laranja</h3>
              <p className="text-slate-600">
                Vibrante e cheio de energia. Ideal para o dia a dia com benefícios diretos nas lojas
                parceiras.
              </p>
            </div>
            <div className="space-y-6 text-center">
              <LandingCard variant="blue" />
              <h3 className="text-xl font-bold text-slate-900">Modelo Azul Escuro</h3>
              <p className="text-slate-600">
                Sóbrio e confiável. Feito para compras de maior volume e acesso a limites
                estendidos.
              </p>
            </div>
            <div className="space-y-6 text-center">
              <LandingCard variant="black" />
              <h3 className="text-xl font-bold text-slate-900">Modelo Premium Preto</h3>
              <p className="text-slate-600">
                Exclusividade total. Acabamento fosco, detalhes em dourado e vantagens VIP globais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Benefícios Exclusivos</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Wallet,
                title: 'Zero Anuidade',
                desc: 'Use seu cartão sem se preocupar com taxas anuais de manutenção.',
              },
              {
                icon: Percent,
                title: 'Cashback Real',
                desc: 'Parte do valor das suas compras volta para você na fatura.',
              },
              {
                icon: ShieldCheck,
                title: 'Segurança Total',
                desc: 'Cartão virtual para compras online e proteção contra fraudes.',
              },
              {
                icon: Zap,
                title: 'Aprovação Rápida',
                desc: 'Análise de crédito em minutos. Comece a usar a versão virtual na hora.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works & Form */}
      <section id="como-funciona" className="py-24 bg-slate-900">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-16">
          <div className="flex-1 space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como Funciona?</h2>
              <p className="text-blue-100 text-lg">
                Seu novo cartão em apenas três passos simples.
              </p>
            </div>
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Solicitação',
                  desc: 'Preencha o formulário com seus dados básicos para análise.',
                },
                {
                  step: '2',
                  title: 'Aprovação',
                  desc: 'Receba a resposta em poucos minutos via e-mail e SMS.',
                },
                {
                  step: '3',
                  title: 'Utilização',
                  desc: 'Baixe o app, ative o cartão virtual e comece a comprar!',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/50">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="form" className="flex-1 lg:max-w-md w-full">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-6 opacity-80">
              <BrandLogo />
            </div>
            <p className="text-sm">
              A plataforma definitiva de cartões private label e co-branded para conectar clientes e
              empresas.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Acessar Conta
                </button>
              </li>
              <li>
                <a href="#beneficios" className="hover:text-white transition-colors">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#cards" className="hover:text-white transition-colors">
                  Modelos de Cartão
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-sm">
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <p>Email: suporte@vclubcard.com.br</p>
            <p>Atendimento: 0800 123 4567</p>
            <p>Horário: Seg a Sex, 09h às 18h</p>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {new Date().getFullYear()} V Club Card. Todos os direitos reservados.
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
    </div>
  )
}
