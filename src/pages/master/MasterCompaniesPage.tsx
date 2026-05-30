import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getLogoUrl,
} from '@/services/companies'
import type { RecordModel } from 'pocketbase'
import { useRealtime } from '@/hooks/use-realtime'
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
  DialogFooter,
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

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0, 'Taxa de comissão deve ser maior ou igual a zero'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companySchema>

export default function MasterCompaniesPage({ defaultTab = 'companies' }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<RecordModel | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      phone: '',
    },
  })

  const loadData = async () => {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('companies', () => {
    loadData()
  })

  const handleOpenDialog = (company?: RecordModel) => {
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
        phone: company.phone || '',
      })
    } else {
      setEditingCompany(null)
      form.reset({
        name: '',
        bin_prefix: '',
        commission_rate: 0,
        modality: '1',
        gateway_provider: 'Asaas',
        status: 'active',
        cnpj: '',
        phone: '',
      })
    }
    setLogoFile(null)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: CompanyFormValues) => {
    setIsSubmitting(true)
    try {
      const data = { ...values, logo: logoFile }
      if (editingCompany) {
        await updateCompany(editingCompany.id, data)
        toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso!' })
      } else {
        await createCompany(data)
        toast({ title: 'Sucesso', description: 'Empresa criada com sucesso!' })
      }
      setIsDialogOpen(false)
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      const errorMsg =
        Object.values(fieldErrors).join(', ') || 'Verifique os dados e tente novamente.'
      toast({
        title: 'Erro ao salvar',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return
    try {
      await deleteCompany(id)
      toast({ title: 'Sucesso', description: 'Empresa excluída com sucesso!' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa.',
        variant: 'destructive',
      })
    }
  }

  const activeCompanies = companies.filter((c) => !c.deleted_at)
  const binnedCompanies = companies.filter((c) => c.deleted_at)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Empresa
        </Button>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="companies">Ativas</TabsTrigger>
          <TabsTrigger value="bins">Lixeira</TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prefixo BIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : activeCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        {company.logo ? (
                          <img
                            src={getLogoUrl(company, company.logo)}
                            alt={company.name}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.bin_prefix}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {company.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="bins" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Exclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {binnedCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      Lixeira vazia.
                    </TableCell>
                  </TableRow>
                ) : (
                  binnedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        {new Date(company.deleted_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input id="name" {...form.register('name')} placeholder="Digite o nome" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bin_prefix">Prefixo BIN</Label>
                <Input id="bin_prefix" {...form.register('bin_prefix')} placeholder="Ex: 4532" />
                {form.formState.errors.bin_prefix && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.bin_prefix.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  {...form.register('commission_rate')}
                />
                {form.formState.errors.commission_rate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.commission_rate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Select
                  onValueChange={(val) => form.setValue('modality', val as any)}
                  defaultValue={form.getValues('modality')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="both">Ambas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gateway_provider">Gateway</Label>
                <Select
                  onValueChange={(val) => form.setValue('gateway_provider', val as any)}
                  defaultValue={form.getValues('gateway_provider')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asaas">Asaas</SelectItem>
                    <SelectItem value="Alternative">Alternativo</SelectItem>
                    <SelectItem value="None/Manual">Nenhum/Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(val) => form.setValue('status', val as any)}
                  defaultValue={form.getValues('status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="logo">Logo da Empresa</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
                {editingCompany?.logo && !logoFile && (
                  <div className="mt-2 flex items-center gap-4">
                    <img
                      src={getLogoUrl(editingCompany, editingCompany.logo)}
                      alt="Logo atual"
                      className="h-12 w-12 rounded object-cover border"
                    />
                    <span className="text-sm text-muted-foreground">Logo atual</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
