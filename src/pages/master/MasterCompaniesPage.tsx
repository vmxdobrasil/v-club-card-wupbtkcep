import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0, 'Taxa de comissão deve ser maior ou igual a 0'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
  cnpj: z
    .string()
    .min(14, 'CNPJ obrigatório')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'CNPJ inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  zip_code: z
    .string()
    .min(8, 'CEP obrigatório')
    .regex(/^\d{5}-\d{3}$|^\d{8}$/, 'CEP inválido'),
  phone: z
    .string()
    .min(10, 'Telefone obrigatório')
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$|^\d{10,11}$/, 'Telefone inválido'),
  responsible_name: z.string().min(2, 'Nome do responsável obrigatório'),
})

type CompanyFormValues = z.infer<typeof companySchema>

export default function MasterCompaniesPage({
  defaultTab = 'companies',
}: {
  defaultTab?: 'companies' | 'bins'
}) {
  const [companies, setCompanies] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      bin_prefix: '',
      commission_rate: 0,
      modality: '1',
      gateway_provider: 'Asaas',
      status: 'active',
      cnpj: '',
      address: '',
      zip_code: '',
      phone: '',
      responsible_name: '',
    },
  })

  const loadCompanies = async () => {
    try {
      const records = await pb.collection('companies').getFullList({ sort: '-created' })
      setCompanies(records)
    } catch (err) {
      console.error(err)
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
      if (editingId) {
        await pb.collection('companies').update(editingId, data)
        toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso' })
      } else {
        await pb.collection('companies').create(data)
        toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso' })
      }
      setIsDialogOpen(false)
      form.reset()
      setEditingId(null)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        form.setError(field as keyof CompanyFormValues, { message: msg })
      })
      if (Object.keys(fieldErrors).length === 0) {
        toast({ title: 'Erro', description: 'Erro ao salvar empresa', variant: 'destructive' })
      }
    }
  }

  const handleEdit = (company: any) => {
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
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja mover esta empresa para a lixeira?')) return
    try {
      await pb.collection('companies').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Empresa movida para a lixeira' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao excluir empresa', variant: 'destructive' })
    }
  }

  const activeCompanies = companies.filter((c) => !c.deleted_at)
  const binnedCompanies = companies.filter((c) => c.deleted_at)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              form.reset()
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Nome da Empresa</FormLabel>
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
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Número, Bairro, Cidade - UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Telefone/WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responsible_name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bin_prefix"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Prefixo BIN</FormLabel>
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
                      <FormItem className="col-span-2 sm:col-span-1">
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
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Modalidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
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
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Provedor de Gateway</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
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
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
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
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar Empresa</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="companies">Empresas Ativas</TabsTrigger>
          <TabsTrigger value="bins">Lixeira</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prefixo BIN</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa ativa cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.cnpj || '-'}</TableCell>
                      <TableCell>{company.responsible_name || '-'}</TableCell>
                      <TableCell>{company.bin_prefix}</TableCell>
                      <TableCell>{company.commission_rate}%</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bins">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Data Exclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {binnedCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Lixeira vazia.
                    </TableCell>
                  </TableRow>
                ) : (
                  binnedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.cnpj || '-'}</TableCell>
                      <TableCell>{new Date(company.deleted_at).toLocaleDateString()}</TableCell>
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
