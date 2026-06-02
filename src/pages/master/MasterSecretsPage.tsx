import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Key, Plus, Trash2, Server } from 'lucide-react'

import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const secretSchema = z.object({
  key: z
    .string()
    .min(1, 'A chave é obrigatória')
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'A chave deve ser maiúscula, alfanumérica com underscores e começar com uma letra (ex: ASAAS_API_KEY)',
    ),
  value: z.string().min(1, 'O valor é obrigatório'),
})

type SecretFormValues = z.infer<typeof secretSchema>

interface SecretRecord {
  id: string
  key: string
  value: string
  created: string
  updated: string
}

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<SecretRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      key: '',
      value: '',
    },
  })

  const loadSecrets = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('platform_settings').getFullList<SecretRecord>({
        sort: '-created',
      })
      setSecrets(records)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [])

  const onSubmit = async (data: SecretFormValues) => {
    try {
      await pb.collection('platform_settings').create(data)
      toast({ title: 'Sucesso', description: 'Integração salva com sucesso!' })
      setOpen(false)
      form.reset()
      loadSecrets()
    } catch (error) {
      const errors = extractFieldErrors(error)
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as any, { type: 'manual', message })
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao salvar a chave. Verifique se ela já existe.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja remover esta chave? Isso pode afetar os pagamentos e funcionalidades da plataforma.',
      )
    )
      return
    try {
      await pb.collection('platform_settings').delete(id)
      toast({ title: 'Removido', description: 'Chave removida com sucesso.' })
      loadSecrets()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a chave.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as chaves de API e configurações globais da plataforma.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) form.reset()
            setOpen(isOpen)
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-5 w-5" />
              Adicionar Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Integração</DialogTitle>
              <DialogDescription>
                Adicione uma nova chave de API para o sistema. Para ativar a integração com o
                gateway de pagamento, use <strong className="text-foreground">ASAAS_API_KEY</strong>
                .
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Chave</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: ASAAS_API_KEY"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Identificador da chave (letras maiúsculas e underscores).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (Token/Secret)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Cole o token aqui" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Configuração</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            Chaves Configuradas
          </CardTitle>
          <CardDescription>
            As chaves listadas abaixo estão ativas e em uso pelos serviços de backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : secrets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3 bg-muted/10 rounded-lg border border-dashed">
              <Key className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-foreground">Nenhuma integração configurada</p>
                <p className="text-sm">Clique em "Adicionar Integração" para começar.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Identificador da Chave</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secrets.map((secret) => (
                    <TableRow key={secret.id}>
                      <TableCell className="font-medium">{secret.key}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground tracking-widest font-mono text-xs">
                          ••••••••••••••••••••••••••••
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(secret.id)}
                          title="Remover chave"
                        >
                          <Trash2 className="h-4 w-4" />
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
