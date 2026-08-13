import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertTriangle, ShieldCheck, Key, RefreshCw, Send } from 'lucide-react'
import { getAsaasConfig, saveAsaasConfig, testAsaasConnection, AsaasConfig } from '@/services/asaas'

export function AsaasConfigStep() {
  const [apiKey, setApiKey] = useState('')
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox')
  const [configStatus, setConfigStatus] = useState<'active' | 'inactive' | 'testing' | 'error'>(
    'inactive',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const config = await getAsaasConfig()
      if (config) {
        setApiKey(config.api_key || '')
        setEnvironment(config.environment || 'sandbox')
        setConfigStatus(config.status || 'inactive')
      }
    } catch (err) {
      console.error('Error loading Asaas config:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        variant: 'destructive',
        title: 'Chave de API em falta',
        description: 'Por favor, insira uma API Key válida do Asaas para testar.',
      })
      return
    }

    if (!apiKey.startsWith('$aact_')) {
      toast({
        variant: 'destructive',
        title: 'Formato de API Key Inválido',
        description: 'A chave da API do Asaas deve obrigatoriamente iniciar com "$aact_".',
      })
      return
    }

    setIsTesting(true)
    try {
      const res = await testAsaasConnection(apiKey, environment)
      setLastTestedAt(new Date().toLocaleTimeString())
      if (res.success) {
        setConfigStatus('active')
        toast({
          title: 'Conexão Bem-Sucedida!',
          description: res.message || 'API Key validada e operante no ambiente Asaas.',
        })
      } else {
        setConfigStatus('error')
        toast({
          variant: 'destructive',
          title: 'Erro na Validação',
          description: res.message || 'Não foi possível conectar com a API Key informada.',
        })
      }
    } catch (err: any) {
      setConfigStatus('error')
      toast({
        variant: 'destructive',
        title: 'Erro no Teste',
        description: err.message || 'Falha ao testar conexão.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Preencha a chave da API antes de salvar.',
      })
      return
    }

    setIsLoading(true)
    try {
      await saveAsaasConfig({
        api_key: apiKey,
        environment,
        status: configStatus === 'active' ? 'active' : 'inactive',
      })
      toast({
        title: 'Configurações Salvas',
        description: 'Credenciais Asaas e ambiente atualizados com sucesso no banco de dados.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: err.message || 'Não foi possível salvar as configurações.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
          configStatus === 'active'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : configStatus === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl flex items-center justify-center text-white ${
              configStatus === 'active'
                ? 'bg-emerald-600'
                : configStatus === 'error'
                  ? 'bg-rose-600'
                  : 'bg-amber-600'
            }`}
          >
            {configStatus === 'active' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Status da Integração</h3>
              <Badge
                className={
                  configStatus === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : configStatus === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                }
              >
                {configStatus === 'active'
                  ? 'Conectado / Ativo'
                  : configStatus === 'error'
                    ? 'Erro na Conexão'
                    : 'Pendente / Não Testado'}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-0.5">
              {configStatus === 'active'
                ? 'Sua conta Asaas está pronta para emitir cobranças em ' +
                  (environment === 'production' ? 'Produção' : 'Sandbox (Testes)') +
                  '.'
                : 'Insira sua chave de API e clique em "Testar Conexão" para validar as credenciais.'}
            </p>
          </div>
        </div>

        {lastTestedAt && (
          <span className="text-xs font-medium text-slate-500 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
            Último teste: {lastTestedAt}
          </span>
        )}
      </div>

      {/* Main Configuration Card */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">
                Etapa 01 — Credenciais e Ambiente Asaas
              </CardTitle>
              <CardDescription className="text-blue-100 text-xs">
                Configure os parâmetros de acesso para cobranças via PIX, Boleto e Cartão de Crédito
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Environment Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-900">
              Selecione o Ambiente de Operação
            </Label>
            <RadioGroup
              value={environment}
              onValueChange={(val) => setEnvironment(val as 'sandbox' | 'production')}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="sandbox" id="env-sandbox" className="peer sr-only" />
                <Label
                  htmlFor="env-sandbox"
                  className="flex flex-col p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Sandbox (Ambiente de Testes)</span>
                    <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                      Ideal para Desenvolvedor
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Transações simuladas na API sandbox.asaas.com (sem custo financeiro real).
                  </span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="production" id="env-production" className="peer sr-only" />
                <Label
                  htmlFor="env-production"
                  className="flex flex-col p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50/50 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Produção (Live)</span>
                    <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                      Dinheiro Real
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Transações reais processadas na API oficial api.asaas.com do Asaas.
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label
              htmlFor="api-key"
              className="text-sm font-semibold text-slate-900 flex items-center justify-between"
            >
              <span>Chave de API (Access Token)</span>
              <span className="text-xs font-normal text-slate-500">Formato: $aact_...</span>
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type="password"
                placeholder="$aact_prod_000MzkwODA2MWY2OGM3MWRl..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 h-12 border-slate-300 font-mono text-sm focus-visible:ring-blue-600"
              />
            </div>
            <p className="text-xs text-slate-500">
              Obtenha a chave no painel da sua conta Asaas em:{' '}
              <strong className="text-slate-700">
                Configurações da Conta &gt; Integrações &gt; Gerar API Key
              </strong>
              .
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="w-full sm:w-auto h-11 px-6 border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2 text-blue-600" />
                  Testar Conexão com Asaas
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md shadow-red-900/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
