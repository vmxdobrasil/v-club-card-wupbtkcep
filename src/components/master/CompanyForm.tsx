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
import { createCompany, updateCompany, type Company } from '@/services/companies'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  bin_prefix: z.string().min(1, 'Prefixo BIN é obrigatório'),
  commission_rate: z.coerce.number().min(0, 'Taxa inválida'),
  modality: z.enum(['1', '2', 'both']),
  gateway_provider: z.enum(['Asaas', 'Alternative', 'None/Manual']),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
  onSuccess: () => void
}

export function CompanyForm({ open, onOpenChange, company, onSuccess }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      bin_prefix: '',
      commission_rate: 0,
      modality: '1',
      gateway_provider: 'Asaas',
      status: 'active',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        company
          ? {
              name: company.name,
              bin_prefix: company.bin_prefix,
              commission_rate: company.commission_rate,
              modality: company.modality,
              gateway_provider: company.gateway_provider,
              status: company.status,
            }
          : {
              name: '',
              bin_prefix: '',
              commission_rate: 0,
              modality: '1',
              gateway_provider: 'Asaas',
              status: 'active',
            },
      )
    }
  }, [open, company, form])

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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
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
            <div className="flex justify-end gap-2 pt-4">
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
