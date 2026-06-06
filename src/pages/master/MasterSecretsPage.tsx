import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

const formSchema = z.object({
  asaasApiKey: z.string().min(1, 'Chave da API é obrigatória'),
  asaasFee: z.string().min(1, 'Taxa/Split é obrigatório'),
})

export default function MasterSecretsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asaasApiKey: '',
      asaasFee: '',
    },
  })

  useEffect(() => {
    const loadSecrets = async () => {
      try {
        const records = await pb.collection('platform_settings').getFullList()
        const apiKey = records.find((r) => r.key === 'ASAAS_API_KEY')?.value || ''
        const fee = records.find((r) => r.key === 'ASAAS_FEE')?.value || ''

        form.reset({
          asaasApiKey: apiKey,
          asaasFee: fee,
        })
      } catch (error) {
        console.error('Failed to load secrets', error)
      }
    }
    loadSecrets()
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      try {
        const apiKeyRecord = await pb
          .collection('platform_settings')
          .getFirstListItem('key="ASAAS_API_KEY"')
        await pb
          .collection('platform_settings')
          .update(apiKeyRecord.id, { value: values.asaasApiKey })
      } catch {
        await pb
          .collection('platform_settings')
          .create({ key: 'ASAAS_API_KEY', value: values.asaasApiKey })
      }

      try {
        const feeRecord = await pb
          .collection('platform_settings')
          .getFirstListItem('key="ASAAS_FEE"')
        await pb.collection('platform_settings').update(feeRecord.id, { value: values.asaasFee })
      } catch {
        await pb
          .collection('platform_settings')
          .create({ key: 'ASAAS_FEE', value: values.asaasFee })
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações de integração salvas com sucesso.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secrets e Integrações</h1>
        <p className="text-muted-foreground">
          Configure as chaves de API e regras de negócio globais da plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração Asaas</CardTitle>
          <CardDescription>
            Configure as credenciais do Asaas para emissão de cobranças e split de pagamentos. A
            chave da API correta sempre começa com o prefixo $aact_
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="asaasApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de API (Access Token)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="$aact_..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Token gerado no painel do Asaas (Configurações da Conta {'>'} Integrações).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="asaasFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa / Split Padrão V Club (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="13.89" {...field} />
                    </FormControl>
                    <FormDescription>
                      Porcentagem padrão retida pela V Club Card em cada transação via Asaas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
