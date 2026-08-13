import { useState } from 'react'
import { Tabs, TabsContent, ListTabs, TabsTrigger } from '@/components/ui/tabs'
import { AsaasConfigStep } from '@/components/asaas/AsaasConfigStep'
import { AsaasLinkGeneratorStep } from '@/components/asaas/AsaasLinkGeneratorStep'
import { AsaasDashboardStep } from '@/components/asaas/AsaasDashboardStep'
import { Key, Link2, LayoutDashboard, ShieldCheck } from 'lucide-react'

export default function MasterAsaasPage() {
  const [activeTab, setActiveTab] = useState('config')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gradient-to-br from-red-600 to-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            Módulo de Pagamentos e Gateway
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            Integração V Club Card —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Asaas
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Gerencie credenciais de API, gere links de pagamento instantâneos (PIX/Boleto/Cartão) e
            acompanhe o histórico completo de liquidação de cobranças.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 md:space-x-8 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Key className="w-4 h-4" />
              Etapa 01 — Configuração API
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Etapa 02 — Gerador de Links
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Etapa 03 — Dashboard / Histórico
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'config' && <AsaasConfigStep />}
          {activeTab === 'generator' && <AsaasLinkGeneratorStep />}
          {activeTab === 'dashboard' && <AsaasDashboardStep />}
        </div>
      </div>
    </div>
  )
}
