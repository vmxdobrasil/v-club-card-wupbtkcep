import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Shield, KeySquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import {
  getSettings,
  createSetting,
  deleteSetting,
  type PlatformSetting,
} from '@/services/platform_settings'

const secretSchema = z.object({
  key: z
    .string()
    .min(1, 'O nome da chave é obrigatório')
    .regex(
      /^[A-Z_]+$/,
      'Apenas letras maiúsculas e underscores são permitidos (ex: ASAAS_API_KEY)',
    ),
  value: z.string().min(1, 'O valor é obrigatório'),
})

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<PlatformSetting[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof secretSchema>>({
    resolver: zodResolver(secretSchema),
    defaultValues: { key: '', value: '' },
  })

  const loadSecrets = async () => {
    try {
      const data = await getSettings()
      setSecrets(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [])

  const onSubmit = async (values: z.infer<typeof secretSchema>) => {
    try {
      await createSetting(values)
      toast({ title: 'Sucesso', description: 'Secret salvo no cofre com sucesso.' })
      setOpen(false)
      form.reset()
      loadSecrets()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Atenção: A remoção desta chave pode quebrar integrações em andamento (ex: ASAAS). Deseja continuar?',
      )
    )
      return
    try {
      await deleteSetting(id)
      toast({ title: 'Removido', description: 'Secret removido do cofre com sucesso.' })
      loadSecrets()
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Cofre de Segredos
          </h2>
          <p className="text-slate-500 mt-1">
            Gerencie chaves de API, webhooks e integrações externas (ex: ASAAS_API_KEY).
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button className="relative z-20 shadow-sm cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Secret</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Chave</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ASAAS_API_KEY"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
                      <FormLabel>Valor do Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Insira o token ou chave secreta..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">
                    Salvar no Cofre
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden mt-6">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Chave de Integração</TableHead>
              <TableHead className="font-semibold">Adicionado em</TableHead>
              <TableHead className="w-[100px] text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secrets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <KeySquare className="w-8 h-8 text-slate-300" />
                    <p>O cofre está vazio. Nenhum secret configurado no momento.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-mono font-medium text-slate-700">
                    {secret.key}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(secret.created).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(secret.id)}
                      title="Remover Secret"
                      className="hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
