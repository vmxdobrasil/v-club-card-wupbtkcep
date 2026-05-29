import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Building2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0, 'Taxa de comissão inválida'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  phone: z.string().min(1, 'Telefone/WhatsApp é obrigatório'),
  responsible_name: z.string().min(1, 'Nome do Responsável é obrigatório'),
})

type CompanyFormValues = z.infer<typeof companySchema>

export default function MasterCompaniesPage({ defaultTab = 'companies' }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [binsHistory, setBinsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      bin_prefix: '',
      commission_rate: 0,
      modality: 'both',
      gateway_provider: 'Asaas',
      status: 'active',
      cnpj: '',
      address: '',
      zip_code: '',
      phone: '',
      responsible_name: '',
    },
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [comps, bins] = await Promise.all([
        pb.collection('companies').getFullList({ sort: '-created' }),
        pb
          .collection('bin_prefix_history')
          .getFullList({ sort: '-created', expand: 'company_id,changed_by' })
          .catch(() => []),
      ])
      setCompanies(comps)
      setBinsHistory(bins)
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      await pb.collection('companies').create(data)
      toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso' })
      setDialogOpen(false)
      form.reset()
      loadData()
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.keys(fieldErrors).forEach((key) => {
        form.setError(key as any, { message: fieldErrors[key] })
      })
      if (Object.keys(fieldErrors).length === 0) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Ocorreu um erro ao cadastrar a empresa.',
        })
      }
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Empresas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as empresas e seus respectivos BINs e comissões.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building2 className="w-5 h-5 text-primary" />
                Cadastrar Nova Empresa
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6 pb-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Razão Social ou Nome Fantasia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-1 md:col-span-2">
                      <div className="w-full h-px bg-gray-100 my-2"></div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Contato e Endereço
                      </h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="responsible_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="João da Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua das Flores, 123 - Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-1 md:col-span-2">
                      <div className="w-full h-px bg-gray-100 my-2"></div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Configurações Operacionais
                      </h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="bin_prefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefixo BIN</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="commission_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Comissão (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Modalidade 1 (Crédito)</SelectItem>
                              <SelectItem value="2">Modalidade 2 (Benefício)</SelectItem>
                              <SelectItem value="both">Ambas as Modalidades</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gateway_provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gateway de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Asaas">Asaas</SelectItem>
                              <SelectItem value="Alternative">Alternativo</SelectItem>
                              <SelectItem value="None/Manual">Nenhum / Manual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status da Empresa</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativa</SelectItem>
                              <SelectItem value="inactive">Inativa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="mr-2"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Salvar Empresa
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="companies">Lista de Empresas</TabsTrigger>
          <TabsTrigger value="bins">Histórico de BINs</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="outline-none">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[300px]">Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>BIN</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id} className="group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{company.name}</span>
                          <span
                            className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]"
                            title={`${company.responsible_name} • ${company.phone}`}
                          >
                            {company.responsible_name} • {company.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{company.cnpj || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-gray-50">
                          {company.bin_prefix}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {company.modality === 'both' ? 'Ambas' : `Modalidade ${company.modality}`}
                      </TableCell>
                      <TableCell className="text-gray-600">{company.gateway_provider}</TableCell>
                      <TableCell>
                        <Badge
                          variant={company.status === 'active' ? 'default' : 'secondary'}
                          className={
                            company.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''
                          }
                        >
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bins" className="outline-none">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Data da Alteração</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>BIN Anterior</TableHead>
                  <TableHead>BIN Novo</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : binsHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      Nenhum registro de alteração encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  binsHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="text-gray-600">
                        {new Date(history.created).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {history.expand?.company_id?.name || 'Desconhecida'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {history.old_prefix || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono border-primary/20 text-primary bg-primary/5"
                        >
                          {history.new_prefix}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {history.expand?.changed_by?.name ||
                          history.expand?.changed_by?.email ||
                          'Sistema'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
