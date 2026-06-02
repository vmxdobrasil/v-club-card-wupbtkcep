import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function IntegrationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [asaasKey, setAsaasKey] = useState('')
  const [settingId, setSettingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    try {
      const records = await pb
        .collection('platform_settings')
        .getFullList({ filter: 'key="ASAAS_API_KEY"' })
      if (records.length > 0) {
        setAsaasKey(records[0].value)
        setSettingId(records[0].id)
      } else {
        setAsaasKey('')
        setSettingId(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (settingId) {
        await pb.collection('platform_settings').update(settingId, { value: asaasKey })
      } else {
        await pb.collection('platform_settings').create({ key: 'ASAAS_API_KEY', value: asaasKey })
      }
      toast({ title: 'Sucesso', description: 'Configurações de integração salvas com sucesso.' })
      onOpenChange(false)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Integração</DialogTitle>
          <DialogDescription>
            Configure as chaves e segredos dos provedores externos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="asaas">ASAAS_API_KEY</Label>
            <Input
              id="asaas"
              value={asaasKey}
              onChange={(e) => setAsaasKey(e.target.value)}
              placeholder="Insira a chave da API do Asaas"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
