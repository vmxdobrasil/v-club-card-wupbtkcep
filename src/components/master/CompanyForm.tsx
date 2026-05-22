import { useEffect } from 'react'
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
import { createCompany, updateCompany, type Company } from '@/services/companies'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Loader2 } from 'lucide-react'

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
    zip_code: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    is_headquarters: z.boolean().default(true),
    parent_company_id: z.string().optional(),
    market_segment: z.string().optional(),
    co_manager: z.string().optional(),
    partner_affiliate: z.string().optional(),
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
      address: '',
      zip_code: '',
      phone: '',
      whatsapp: '',
      is_headquarters: true,
      parent_company_id: '',
      market_segment: '',
      co_manager: '',
      partner_affiliate: '',
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
              zip_code: company.zip_code || '',
              phone: company.phone || '',
              whatsapp: company.whatsapp || '',
              is_headquarters: company.is_headquarters ?? true,
              parent_company_id: company.parent_company_id || '',
              market_segment: company.market_segment || '',
              co_manager: company.co_manager || '',
              partner_affiliate: company.partner_affiliate || '',
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
              zip_code: '',
              phone: '',
              whatsapp: '',
              is_headquarters: true,
              parent_company_id: '',
              market_segment: '',
              co_manager: '',
              partner_affiliate: '',
            },
      )
    }
  }, [open, company, form])

  const parentOptions = companies.filter((c) => c.id !== company?.id && c.is_headquarters)
  const isHeadquarters = form.watch('is_headquarters')

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
        toast.error('Ocorreu um erro ao salvar a empresa.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-6 pb-4">
                {/* Dados Principais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium leading-none">Dados Principais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
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
                        <FormItem>
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
                          <FormLabel>Prefixo BIN</FormLabel>
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
                  </div>
                </div>

                {/* Hierarquia e Segmento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium leading-none">Hierarquia e Segmento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_headquarters"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2 sm:col-span-1">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">É matriz?</FormLabel>
                            <div className="text-[0.8rem] text-muted-foreground">
                              Desmarque se esta empresa for uma filial.
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
                          <FormItem className="col-span-2 sm:col-span-1">
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

                    <FormField
                      control={form.control}
                      name="co_manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-gestora (Cobranded)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Opcional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="partner_affiliate"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Parceira / Afiliada</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Opcional" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contato e Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium leading-none">Contato e Endereço</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(applyCepMask(e.target.value))}
                              placeholder="00000-000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Rua, Número, Bairro, Cidade - UF" />
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
                        <FormItem>
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
                </div>
              </div>
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
