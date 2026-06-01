import { useEffect, useState } from 'react'
import { Plus, Trash2, Key } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface Secret {
  id: string
  key: string
  value: string
  created: string
}

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const loadSecrets = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList<Secret>({
        sort: '-created',
      })
      setSecrets(records)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os segredos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [])

  const handleCreate = async () => {
    if (!key || !value) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    const keyRegex = /^[A-Z0-9_]+$/
    if (!keyRegex.test(key)) {
      toast({
        title: 'Chave Inválida',
        description:
          'A chave deve conter apenas letras maiúsculas, números e underscores (ex: ASAAS_API_KEY).',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await pb.collection('platform_settings').create({
        key,
        value,
      })
      toast({ title: 'Sucesso', description: 'Segredo criado com sucesso.' })
      setOpen(false)
      setKey('')
      setValue('')
      loadSecrets()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar',
        description: 'Verifique se a chave já existe ou tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('platform_settings').delete(id)
      toast({ title: 'Sucesso', description: 'Segredo removido com sucesso.' })
      setSecrets((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o segredo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segredos</h1>
          <p className="text-muted-foreground mt-1">Gerencie variáveis de ambiente e integrações</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 z-10 relative cursor-pointer" size="lg">
              <Plus className="w-5 h-5" />
              Novo Segredo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Segredo</DialogTitle>
              <DialogDescription>
                Crie uma nova chave para uso na plataforma (ex: ASAAS_API_KEY).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Chave (Key)</Label>
                <Input
                  id="key"
                  placeholder="ASAAS_API_KEY"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                />
                <span className="text-xs text-muted-foreground">
                  Apenas maiúsculas, números e underscore (_).
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Valor (Value)</Label>
                <Input
                  id="value"
                  type="password"
                  placeholder="Seu token ou segredo..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Chaves Configuradas
          </CardTitle>
          <CardDescription>
            Estas chaves estão disponíveis para uso em hooks e integrações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : secrets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum segredo configurado no momento.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secrets.map((secret) => (
                    <TableRow key={secret.id}>
                      <TableCell className="font-mono text-sm font-medium">{secret.key}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        ••••••••••••••••
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer relative z-10"
                          onClick={() => handleDelete(secret.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
