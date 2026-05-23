import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createCompany, updateCompany, type Company } from '@/services/companies'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Search, History } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { CompanyHistoryModal } from './CompanyHistoryModal'

const schema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cnpj: z.string().min(18, 'CNPJ inválido'),
    bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
    commission_rate: z.coerce.number().min(0, 'Taxa inválida'),
    modality: z.enum(['1', '2', 'both']),
    gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
    status: z.enum(['active', 'inactive']),
    address: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    cep: z.string().optional(),
    social_links: z.any().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    is_headquarters: z.boolean().default(false),
    is_partner: z.boolean().default(false),
    parent_company_id: z.string().optional(),
    market_segment: z.string().optional(),
    cobranded_id: z.string().optional(),
    affiliate_id: z.string().optional(),
  })
  .refine((data) => data.is_headquarters || !!data.parent_company_id, {
    message: 'Selecione a matriz para esta filial',
    path: ['parent_company_id'],
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
  companies: Company[]
  onSuccess: () => void
}

const applyCnpjMask = (val: string) => {
  return val
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

const applyCepMask = (val: string) => {
  return val
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

const applyPhoneMask = (val: string) => {
  const digits = val.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14)
  }
  return digits
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function CompanyForm({ open, onOpenChange, company, companies, onSuccess }: Props) {
  const [partners, setPartners] = useState<any[]>([])
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (open) {
      pb.collection('users')
        .getFullList({ filter: "role='partner'" })
        .then(setPartners)
        .catch(console.error)
    }
  }, [open])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cnpj: '',
      bin_prefix: '',
      commission_rate: 0,
      modality: '1',
      gateway_provider: 'Asaas',
      status: 'active',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      social_links: {},
      phone: '',
      whatsapp: '',
      is_headquarters: false,
      is_partner: false,
      parent_company_id: '',
      market_segment: '',
      cobranded_id: '',
      affiliate_id: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        company
          ? {
              name: company.name,
              cnpj: company.cnpj || '',
              bin_prefix: company.bin_prefix,
              commission_rate: company.commission_rate,
              modality: company.modality,
              gateway_provider: company.gateway_provider,
              status: company.status,
              address: company.address || '',
              number: company.number || '',
              complement: company.complement || '',
              neighborhood: company.neighborhood || '',
              city: company.city || '',
              state: company.state || '',
              cep: company.cep || '',
              social_links: company.social_links || {},
              phone: company.phone || '',
              whatsapp: company.whatsapp || '',
              is_headquarters: company.is_headquarters ?? false,
              is_partner: company.is_partner ?? false,
              parent_company_id: company.parent_company_id || '',
              market_segment: company.market_segment || '',
              cobranded_id: company.cobranded_id || '',
              affiliate_id: company.affiliate_id || '',
            }
          : {
              name: '',
              cnpj: '',
              bin_prefix: '',
              commission_rate: 0,
              modality: '1',
              gateway_provider: 'Asaas',
              status: 'active',
              address: '',
              number: '',
              complement: '',
              neighborhood: '',
              city: '',
              state: '',
              cep: '',
              social_links: {},
              phone: '',
              whatsapp: '',
              is_headquarters: false,
              is_partner: false,
              parent_company_id: '',
              market_segment: '',
              cobranded_id: '',
              affiliate_id: '',
            },
      )
    }
  }, [open, company, form])

  const parentOptions = companies.filter((c) => c.id !== company?.id && c.is_headquarters)
  const isHeadquarters = form.watch('is_headquarters')

  const handleFetchAddress = async () => {
    const cep = form.getValues('cep') || ''
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setIsFetchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          form.setValue('address', data.logradouro || '')
          form.setValue('neighborhood', data.bairro || '')
          form.setValue('city', data.localidade || '')
          form.setValue('state', data.uf || '')
          toast.success('Endereço preenchido automaticamente.')
        } else {
          form.setError('cep', { message: 'CEP não encontrado.' })
        }
      } catch (err) {
        form.setError('cep', { message: 'Erro ao buscar CEP.' })
      } finally {
        setIsFetchingCep(false)
      }
    } else {
      form.setError('cep', { message: 'Preencha um CEP válido (8 dígitos).' })
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      if (company) await updateCompany(company.id, data)
      else await createCompany(data)

      toast.success(company ? 'Empresa atualizada com sucesso' : 'Empresa criada com sucesso')
      onSuccess()
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) =>
          form.setError(field as any, { message: msg }),
        )
      } else {
        toast.error('Ocorreu um erro ao salvar a empresa. Verifique se o CNPJ ou BIN já existem.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <CompanyHistoryModal
          companyId={company?.id || null}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="general">Geral</TabsTrigger>
                  <TabsTrigger value="location">Localização</TabsTrigger>
                  <TabsTrigger value="hierarchy">Hierarquia</TabsTrigger>
                  <TabsTrigger value="partners">Parcerias</TabsTrigger>
                </TabsList>

                {/* ABA: Geral */}
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel>Nome da Empresa / Razão Social</FormLabel>
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
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(applyCnpjMask(e.target.value))}
                              placeholder="00.000.000/0001-00"
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
                          <div className="flex items-center justify-between">
                            <FormLabel>Prefixo BIN</FormLabel>
                            {company && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2 text-primary hover:text-primary/80"
                                onClick={() => setHistoryOpen(true)}
                              >
                                <History className="w-3 h-3 mr-1" /> Histórico
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <Input {...field} placeholder="Ex: 636943" />
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
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Modo 1 (Varejo)</SelectItem>
                              <SelectItem value="2">Modo 2 (Consignado)</SelectItem>
                              <SelectItem value="both">Ambos</SelectItem>
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
                                <SelectValue />
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
                                <SelectValue />
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
                      name="market_segment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segmento de Mercado</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Varejo, Alimentação" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* ABA: Localização */}
                <TabsContent value="location" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>CEP</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const val = applyCepMask(e.target.value)
                                  field.onChange(val)
                                }}
                                onBlur={(e) => {
                                  field.onBlur()
                                  handleFetchAddress()
                                }}
                                placeholder="00000-000"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleFetchAddress}
                              disabled={isFetchingCep}
                            >
                              {isFetchingCep ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Search className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-1 md:col-span-2 hidden md:block"></div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-3">
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Rua, Avenida..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-1">
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Sala 1, Bloco A" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Centro" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-3">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="São Paulo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-1">
                          <FormLabel>Estado (UF)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SP" maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                              placeholder="(00) 0000-0000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                              placeholder="(00) 90000-0000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* ABA: Hierarquia */}
                <TabsContent value="hierarchy" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_headquarters"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">É Matriz (Sede)?</FormLabel>
                            <div className="text-[0.8rem] text-muted-foreground">
                              Marque se esta empresa opera como sede da rede.
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(val) => {
                                field.onChange(val)
                                if (val) form.setValue('parent_company_id', '')
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isHeadquarters && (
                      <FormField
                        control={form.control}
                        name="parent_company_id"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Selecione a Matriz</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a empresa matriz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {parentOptions.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </SelectItem>
                                ))}
                                {parentOptions.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    Nenhuma matriz disponível
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </TabsContent>

                {/* ABA: Parcerias */}
                <TabsContent value="partners" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_partner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Empresa Parceira?</FormLabel>
                            <div className="text-[0.8rem] text-muted-foreground">
                              Designar esta empresa como uma Parceira de Negócios oficial.
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cobranded_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel>Co-gestora (Cobranded)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {partners.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name || p.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="affiliate_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel>Parceira / Afiliada</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {partners.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name || p.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
