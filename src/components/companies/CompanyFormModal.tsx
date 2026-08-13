import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Image as ImageIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const companySchema = z.object({
  name: z.string().min(1, 'Nome da Empresa é obrigatório'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  phone: z.string().min(1, 'Telefone/WhatsApp é obrigatório'),
  responsible_name: z.string().min(1, 'Nome do Responsável é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo do BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0, 'Taxa inválida'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormModalProps {
  isOpen: boolean
  onClose: () => void
  company: any | null
  onSuccess: () => void
}

export function CompanyFormModal({ isOpen, onClose, company, onSuccess }: CompanyFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: {
      name: '',
      cnpj: '',
      zip_code: '',
      address: '',
      phone: '',
      responsible_name: '',
      bin_prefix: '',
      commission_rate: 0,
      modality: 'both',
      gateway_provider: 'Asaas',
      status: 'active',
    },
  })

  useEffect(() => {
    if (company && isOpen) {
      form.reset({
        name: company.name || '',
        cnpj: company.cnpj || '',
        zip_code: company.zip_code || '',
        address: company.address || '',
        phone: company.phone || '',
        responsible_name: company.responsible_name || '',
        bin_prefix: company.bin_prefix || '',
        commission_rate: company.commission_rate || 0,
        modality: company.modality || 'both',
        gateway_provider: company.gateway_provider || 'Asaas',
        status: company.status || 'active',
      })
      if (company.logo) {
        setLogoPreview(pb.files.getURL(company, company.logo))
      } else {
        setLogoPreview(null)
      }
    } else {
      form.reset({
        name: '',
        cnpj: '',
        zip_code: '',
        address: '',
        phone: '',
        responsible_name: '',
        bin_prefix: '',
        commission_rate: 0,
        modality: 'both',
        gateway_provider: 'Asaas',
        status: 'active',
      })
      setLogoPreview(null)
      setLogoFile(null)
    }
  }, [company, isOpen, form])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      setLoading(true)
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)))
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      if (company?.id) {
        await pb.collection('companies').update(company.id, formData)
        toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso.' })
      } else {
        await pb.collection('companies').create(formData)
        toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso.' })
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar empresa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-4 mb-4">
                <FormLabel>Logomarca</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full max-w-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Input placeholder="00.000.000/0001-00" {...field} />
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
                  name="responsible_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Completo" {...field} />
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
                      <FormLabel>Prefixo do BIN</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 4123" {...field} />
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
                      <FormLabel>Provedor de Pagamento</FormLabel>
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
                      <FormLabel>Status</FormLabel>
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
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4 pb-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
