import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import pb from '@/lib/pocketbase/client'

export default function MasterSecretsPage() {
  const [apiKey, setApiKey] = useState('')
  const [asaasEnv, setAsaasEnv] = useState('')
  const [loading, setLoading] = useState(false)
  const [testHolderId, setTestHolderId] = useState('')
  const [testCompanyId, setTestCompanyId] = useState('')
  const [testAmount, setTestAmount] = useState('10.00')
  const [isTestOpen, setIsTestOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList()
      const keyRecord = records.find((r) => r.key === 'ASAAS_API_KEY')
      const envRecord = records.find((r) => r.key === 'ASAAS_ENV')

      if (keyRecord) setApiKey(keyRecord.value)
      if (envRecord) setAsaasEnv(envRecord.value)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('platform_settings').getFullList()
      const saveSetting = async (key: string, value: string) => {
        const record = records.find((r) => r.key === key)
        if (record) {
          await pb.collection('platform_settings').update(record.id, { value })
        } else {
          await pb.collection('platform_settings').create({ key, value })
        }
      }

      await saveSetting('ASAAS_API_KEY', apiKey)
      await saveSetting('ASAAS_ENV', asaasEnv || 'sandbox')

      toast({
        title: 'Configurações salvas',
        description: 'As credenciais foram atualizadas com sucesso.',
      })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleTestTransaction = async () => {
    try {
      if (!testHolderId || !testCompanyId || !testAmount) {
        toast({ title: 'Preencha todos os campos', variant: 'destructive' })
        return
      }

      const record = await pb.collection('transactions').create({
        holder_id: testHolderId,
        company_id: testCompanyId,
        amount: parseFloat(testAmount),
        type: 'credit', // credit evaluates Asaas logic in hook
        status: 'pending',
      })

      toast({
        title: 'Transação Teste Criada',
        description: `ID: ${record.id} - Ref Asaas: ${record.gateway_ref || 'Pendente'}`,
      })
      setIsTestOpen(false)
    } catch (error: any) {
      toast({ title: 'Erro na Transação', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Configurações do Sistema</h1>

      <Card>
        <CardHeader>
          <CardTitle>Integração Asaas</CardTitle>
          <CardDescription>
            Configure as chaves de API para emissão e cobrança via gateway Asaas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ambiente (sandbox / production)</Label>
            <Input
              value={asaasEnv}
              onChange={(e) => setAsaasEnv(e.target.value)}
              placeholder="sandbox"
            />
          </div>
          <div className="space-y-2">
            <Label>API Key (Asaas)</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="$aact_..."
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Teste</CardTitle>
          <CardDescription>Valide a integração simulando uma transação via Asaas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Testar Transação no Gateway</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Simular Transação Asaas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ID do Portador</Label>
                  <Input
                    value={testHolderId}
                    onChange={(e) => setTestHolderId(e.target.value)}
                    placeholder="ex: 1z2x3c4v..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID da Empresa</Label>
                  <Input
                    value={testCompanyId}
                    onChange={(e) => setTestCompanyId(e.target.value)}
                    placeholder="ex: 9q8w7e6r..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                </div>
                <Button onClick={handleTestTransaction} className="w-full">
                  Executar Teste
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
