import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound, Plus, Trash2, Save } from 'lucide-react'
import { z } from 'zod'

const secretKeySchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/, {
  message:
    'A chave deve começar com uma letra maiúscula, contendo apenas letras maiúsculas, números e sublinhados (ex: ASAAS_API_KEY).',
})

interface Secret {
  id: string
  key: string
  value: string
}

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    loadSecrets()
  }, [])

  const loadSecrets = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList()
      setSecrets(records.map((r) => ({ id: r.id, key: r.key, value: r.value })))
    } catch (error) {
      toast.error('Erro ao carregar configurações.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSecret = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error('Preencha chave e valor.')
      return
    }

    const parseResult = secretKeySchema.safeParse(newKey)
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0].message)
      return
    }

    try {
      await pb.collection('platform_settings').create({
        key: newKey,
        value: newValue,
      })
      toast.success('Segredo adicionado com sucesso.')
      setNewKey('')
      setNewValue('')
      loadSecrets()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar segredo.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('platform_settings').delete(id)
      toast.success('Segredo removido.')
      loadSecrets()
    } catch (error) {
      toast.error('Erro ao remover segredo.')
    }
  }

  const updateExisting = async (id: string, currentKey: string, newValue: string) => {
    try {
      await pb.collection('platform_settings').update(id, { value: newValue })
      toast.success('Valor atualizado.')
      loadSecrets()
    } catch (e) {
      toast.error('Erro ao atualizar.')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <KeyRound className="w-8 h-8 text-primary" />
          Segredos e Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as variáveis de ambiente e chaves de API da plataforma. Respeite as convenções de
          nomenclatura.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Segredo</CardTitle>
          <CardDescription>
            Use estritamente letras maiúsculas e sublinhados (ex: ASAAS_API_KEY).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <Label>Chave (Key)</Label>
              <Input
                placeholder="ASAAS_API_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label>Valor (Value)</Label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button onClick={handleAddSecret} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Segredos Ativos</h3>
        {secrets.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum segredo configurado.</p>
        ) : (
          secrets.map((secret) => (
            <Card key={secret.id}>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Chave</Label>
                  <div className="font-mono text-sm font-semibold">{secret.key}</div>
                </div>
                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Valor</Label>
                  <Input
                    type="password"
                    defaultValue={secret.value}
                    onChange={(e) => {
                      const updated = [...secrets]
                      const idx = updated.findIndex((s) => s.id === secret.id)
                      if (idx > -1) updated[idx].value = e.target.value
                      setSecrets(updated)
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 sm:pt-5 w-full sm:w-auto justify-end">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => updateExisting(secret.id, secret.key, secret.value)}
                    title="Salvar alteração"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(secret.id)}
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
