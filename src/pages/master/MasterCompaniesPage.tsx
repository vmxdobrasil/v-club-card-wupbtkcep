import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  getCompanies,
  createCompany,
  updateCompany,
  softDeleteCompany,
  type Company,
} from '@/services/companies'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

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
  DialogFooter,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce
    .number()
    .min(0.00025, 'O mínimo é 0.00025')
    .max(0.01, 'O máximo é 0.01'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  responsible_name: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function MasterCompaniesPage({ defaultTab = 'companies' }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      bin_prefix: '',
      commission_rate: 0.005,
      modality: 'both',
      gateway_provider: 'Asaas',
      status: 'active',
      cnpj: '',
      address: '',
      zip_code: '',
      phone: '',
      whatsapp: '',
      responsible_name: '',
    },
  })

  const loadData = async () => {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (err) {
      toast({ title: 'Erro ao carregar empresas', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('companies', () => {
    loadData()
  })

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
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
        whatsapp: company.whatsapp || '',
        responsible_name: company.responsible_name || '',
      })
    } else {
      setEditingCompany(null)
      form.reset({
        name: '',
        bin_prefix: '',
        commission_rate: 0.005,
        modality: 'both',
        gateway_provider: 'Asaas',
        status: 'active',
        cnpj: '',
        address: '',
        zip_code: '',
        phone: '',
        whatsapp: '',
        responsible_name: '',
      })
    }
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })

      if (selectedFile) {
        formData.append('logo', selectedFile)
      }

      if (editingCompany) {
        await updateCompany(editingCompany.id, formData)
        toast({ title: 'Empresa atualizada com sucesso' })
      } else {
        await createCompany(formData)
        toast({ title: 'Empresa criada com sucesso' })
      }
      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg })
        })
      } else {
        toast({ title: 'Erro ao salvar os dados', variant: 'destructive' })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente mover esta empresa para a lixeira?')) return
    try {
      await softDeleteCompany(id)
      toast({ title: 'Empresa removida com sucesso' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao excluir a empresa', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Empresas</h1>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="bins">Histórico de BINs</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Empresa
            </Button>
          </div>

          <div className="rounded-md border bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Logomarca</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      {company.logo ? (
                        <img
                          src={pb.files.getURL(company, company.logo, { thumb: '100x100' })}
                          alt={`Logo ${company.name}`}
                          className="h-10 w-10 object-contain rounded-md border bg-white"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{company.name}</TableCell>
                    <TableCell className="text-slate-600">{company.cnpj || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {company.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(company)}
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {companies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Nenhuma empresa cadastrada no sistema.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bins" className="pt-4">
          <div className="rounded-md border bg-white p-12 text-center text-slate-500 shadow-sm">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">Aba de Histórico de BINs</p>
            <p className="text-sm mt-1">Esta funcionalidade está em desenvolvimento.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para {editingCompany ? 'atualizar' : 'cadastrar'} a empresa.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Supermercado V Club" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Logomarca</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </FormControl>
                  <p className="text-[0.8rem] text-slate-500 mt-1">
                    Formatos suportados: JPG, PNG. O envio substituirá a imagem atual.
                  </p>
                </FormItem>

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

                <FormField
                  control={form.control}
                  name="responsible_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do diretor/gerente" {...field} />
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
                      <FormLabel>Telefone Fixo</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 90000-0000" {...field} />
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, Número, Complemento, Bairro, Cidade - UF"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">
                    Configurações Financeiras e Gateway
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="bin_prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefixo BIN *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 603587" {...field} />
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
                        <Input type="number" step="0.0001" {...field} />
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
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Modalidade 1 (Crédito)</SelectItem>
                          <SelectItem value="2">Modalidade 2 (Benefício)</SelectItem>
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
                      <FormLabel>Provedor de Gateway *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o provedor" />
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="max-w-[200px]">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo (Permitir Operações)</SelectItem>
                          <SelectItem value="inactive">Inativo (Bloqueado)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-8 pt-4 border-t gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Salvar Dados da Empresa
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
