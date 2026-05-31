import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Key } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

const secretSchema = z.object({
  key: z
    .string()
    .regex(/^[A-Z0-9_]+$/, 'A chave deve conter apenas letras maiúsculas, números e underlines'),
  value: z.string().min(1, 'O valor é obrigatório'),
})

type SecretFormValues = z.infer<typeof secretSchema>

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
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
      const records = await pb.collection('platform_settings').getFullList({
        sort: '-created',
      })
      setSecrets(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [])

  useRealtime('platform_settings', () => {
    loadSecrets()
  })

  const onSubmit = async (data: SecretFormValues) => {
    try {
      await pb.collection('platform_settings').create(data)
      toast({ title: 'Sucesso', description: 'Secret adicionado com sucesso.' })
      setIsOpen(false)
      form.reset()
    } catch (error) {
      const errors = extractFieldErrors(error)
      if (errors.key) {
        form.setError('key', { message: errors.key })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível adicionar o secret. A chave pode já existir.',
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('platform_settings').delete(id)
      toast({ title: 'Sucesso', description: 'Secret removido com sucesso.' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o secret.',
      })
    }
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secrets</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações e secrets da plataforma.
          </p>
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={(val) => {
            setIsOpen(val)
            if (!val) form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button className="relative z-20">
              <Plus className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Secret</DialogTitle>
              <DialogDescription>
                Adicione uma nova configuração ou chave de API (ex: ASAAS_API_KEY).
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="ASAAS_API_KEY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Token ou valor..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Salvar Secret
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum secret configurado.
                  </TableCell>
                </TableRow>
              ) : (
                secrets.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        <span>{secret.key}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">••••••••••••••••</code>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(secret.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
