import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const companySchema = z.object({
  name: z.string().min(1, 'Razão Social / Nome é obrigatório'),
  cnpj: z.string().optional(),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0.00025).max(0.01),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
})
type CompanyFormValues = z.infer<typeof companySchema>

export default function MasterCompaniesPage({ defaultTab = 'companies' }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      cnpj: '',
      bin_prefix: '',
      commission_rate: 0.01,
      modality: 'both',
      gateway_provider: 'Asaas',
      status: 'active',
    },
  })

  const loadCompanies = async () => {
    try {
      setCompanies(await pb.collection('companies').getFullList({ sort: '-created' }))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar empresas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])
  useRealtime('companies', () => {
    loadCompanies()
  })

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => formData.append(key, value as string))
      if (selectedFile) formData.append('logo', selectedFile)

      await pb.collection('companies').create(formData)
      toast({ title: 'Sucesso', description: 'Empresa salva com sucesso!' })
      setIsDialogOpen(false)
      form.reset()
      setSelectedFile(null)
    } catch (err: any) {
      Object.entries(extractFieldErrors(err)).forEach(([field, msg]) =>
        form.setError(field as any, { message: msg }),
      )
      toast({ title: 'Erro', description: 'Falha ao salvar a empresa.', variant: 'destructive' })
    }
  }

  const activeCompanies = companies.filter((c) => !c.deleted_at)
  const binCompanies = companies.filter((c) => c.deleted_at)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Empresas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Cadastrar Empresa</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Razão Social / Nome</Label>
                <Input {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input {...form.register('cnpj')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prefixo BIN</Label>
                  <Input {...form.register('bin_prefix')} />
                  {form.formState.errors.bin_prefix && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.bin_prefix.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Taxa (ex: 0.01)</Label>
                  <Input type="number" step="0.0001" {...form.register('commission_rate')} />
                  {form.formState.errors.commission_rate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.commission_rate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Select
                    onValueChange={(v) => form.setValue('modality', v as any)}
                    defaultValue={form.getValues('modality')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="both">Ambas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gateway</Label>
                  <Select
                    onValueChange={(v) => form.setValue('gateway_provider', v as any)}
                    defaultValue={form.getValues('gateway_provider')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asaas">Asaas</SelectItem>
                      <SelectItem value="Alternative">Alternativo</SelectItem>
                      <SelectItem value="None/Manual">Nenhum/Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Situação</Label>
                <Select
                  onValueChange={(v) => form.setValue('status', v as any)}
                  defaultValue={form.getValues('status')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="companies">Ativas</TabsTrigger>
          <TabsTrigger value="bins">Lixeira</TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="mt-4 border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Prefixo BIN</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : activeCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                activeCompanies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.logo ? (
                        <img
                          src={pb.files.getURL(c, c.logo)}
                          alt={c.name}
                          className="h-8 w-auto object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-muted flex items-center justify-center text-xs text-muted-foreground rounded">
                          Sem logo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.cnpj || '-'}</TableCell>
                    <TableCell>{c.bin_prefix}</TableCell>
                    <TableCell>{(c.commission_rate * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {c.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="bins" className="mt-4 border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>Prefixo BIN</TableHead>
                <TableHead>Data de Exclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {binCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma empresa na lixeira.
                  </TableCell>
                </TableRow>
              ) : (
                binCompanies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.bin_prefix}</TableCell>
                    <TableCell>{new Date(c.deleted_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
