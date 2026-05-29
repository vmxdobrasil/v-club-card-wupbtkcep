import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  type Company,
} from '@/services/companies'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Building2, CreditCard, Trash2, Edit2 } from 'lucide-react'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const maskCnpj = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

const maskCep = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9)
}

const maskPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14)
  }
  return cleaned
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15)
}

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0.00025).max(0.01),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
  responsible_name: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function MasterCompaniesPage({
  defaultTab = 'companies',
}: {
  defaultTab?: 'companies' | 'bins'
}) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      bin_prefix: '',
      commission_rate: 0.005,
      modality: '1',
      gateway_provider: 'None/Manual',
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
      const data = await getCompanies()
      setCompanies(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar empresas.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (data: FormValues) => {
    try {
      if (editingId) {
        await updateCompany(editingId, data)
        toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso.' })
      } else {
        await createCompany(data)
        toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso.' })
      }
      setOpen(false)
      form.reset()
      setEditingId(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      const errors = extractFieldErrors(err)
      if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: errors[key] })
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Verifique os dados informados.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleEdit = (company: Company) => {
    setEditingId(company.id)
    form.reset({
      name: company.name,
      bin_prefix: company.bin_prefix,
      commission_rate: company.commission_rate,
      modality: company.modality,
      gateway_provider: company.gateway_provider,
      status: company.status,
      cnpj: company.cnpj || '',
      address: company.address || '',
      zip_code: company.zip_code || '',
      phone: company.phone || '',
      responsible_name: company.responsible_name || '',
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return
    try {
      await deleteCompany(id)
      toast({ title: 'Sucesso', description: 'Empresa excluída.' })
      loadData()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h1>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) {
              form.reset()
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(maskCnpj(e.target.value))}
                            placeholder="00.000.000/0000-00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bin_prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefixo BIN *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Taxa de Comissão *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" {...field} />
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
                        <FormLabel>Modalidade *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Modalidade 1</SelectItem>
                            <SelectItem value="2">Modalidade 2</SelectItem>
                            <SelectItem value="both">Ambas</SelectItem>
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
                        <FormLabel>Gateway *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Asaas">Asaas</SelectItem>
                            <SelectItem value="Alternative">Alternativo</SelectItem>
                            <SelectItem value="None/Manual">Nenhum/Manual</SelectItem>
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
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                          />
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
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(maskCep(e.target.value))}
                            placeholder="00000-000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responsible_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Empresa'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 size={16} /> Empresas
          </TabsTrigger>
          <TabsTrigger value="bins" className="flex items-center gap-2">
            <CreditCard size={16} /> Controle de BINs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-6">
          <div className="bg-white border rounded-md shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.cnpj || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>{company.gateway_provider}</TableCell>
                      <TableCell>{company.phone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(company.id)}
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
        </TabsContent>

        <TabsContent value="bins" className="mt-6">
          <div className="bg-white border rounded-md shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Prefixo BIN</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhuma BIN encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={`bin-${company.id}`}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="font-mono">{company.bin_prefix}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
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
