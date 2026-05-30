import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { maskCPF, maskCEP, maskPhone } from '@/lib/masks'
import { createCardHolder, type CardHolderData } from '@/services/card_holders'

const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z.string().min(14, 'CPF incompleto'),
  address: z.string().optional(),
  cep: z.string().optional(),
  whatsapp: z.string().optional(),
  total_limit: z.coerce.number().min(0, 'Limite não pode ser negativo'),
  card_type: z.enum(['physical_virtual', 'virtual_only']),
  credit_source: z.enum(['proprietary', 'asaas']),
  company_id: z.string().min(1, 'Selecione uma empresa'),
  parent_holder_id: z.string().optional(),
  avatar: z.any().optional(),
})

export function CardHolderForm({
  companies,
  holders,
  onSuccess,
}: {
  companies: any[]
  holders: any[]
  onSuccess: () => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      address: '',
      cep: '',
      whatsapp: '',
      total_limit: 0,
      card_type: 'physical_virtual',
      credit_source: 'proprietary',
      company_id: '',
      parent_holder_id: 'none',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: CardHolderData = {
        ...values,
        parent_holder_id: values.parent_holder_id === 'none' ? undefined : values.parent_holder_id,
      }
      await createCardHolder(payload)
      toast.success('Portador cadastrado com sucesso!')
      form.reset()
      onSuccess()
    } catch (error: any) {
      toast.error('Erro ao cadastrar portador.', {
        description: error.message || 'Verifique os dados e tente novamente.',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="João da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) => field.onChange(maskCPF(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail (Opcional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="joao@exemplo.com" {...field} />
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
                <FormLabel>Telefone/WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onChange={(e) => field.onChange(maskCEP(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="total_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de Crédito (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <Input placeholder="Rua das Flores, 123 - Centro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="card_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cartão</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="physical_virtual">Físico e Virtual</SelectItem>
                    <SelectItem value="virtual_only">Apenas Virtual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credit_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte de Crédito</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="proprietary">Crédito Próprio</SelectItem>
                    <SelectItem value="asaas">Integração Asaas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
            name="parent_holder_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dependente de (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Titular)</SelectItem>
                    {holders
                      .filter((h) => !h.parent_holder_id)
                      .map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.expand?.user_id?.name || 'Sem nome'} - {h.cpf}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Foto de Perfil (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...fieldProps}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Portador'}
        </Button>
      </form>
    </Form>
  )
}
