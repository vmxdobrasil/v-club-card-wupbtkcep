import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  company_id: z.string().min(1, 'Empresa obrigatória'),
  cpf: z.string().min(14, 'CPF inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  cep: z.string().min(9, 'CEP inválido'),
  whatsapp: z.string().min(14, 'WhatsApp inválido'),
  card_type: z.enum(['physical_virtual', 'virtual_only']),
  credit_source: z.enum(['proprietary', 'asaas']),
  total_limit: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

const mCpf = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    .slice(0, 14)
const mCep = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{3})/, '$1-$2')
    .slice(0, 9)
const mTel = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    .slice(0, 15)

export function HolderForm({ onSuccess }: { onSuccess: () => void }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      card_type: 'physical_virtual',
      credit_source: 'proprietary',
      total_limit: 1000,
    },
  })

  useEffect(() => {
    pb.collection('companies')
      .getFullList({ filter: 'status="active"' })
      .then(setCompanies)
      .catch(console.error)
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('email', data.email)
      fd.append('password', data.password)
      fd.append('passwordConfirm', data.password)
      fd.append('name', data.name)
      fd.append('role', 'holder')
      if (avatar) fd.append('avatar', avatar)

      const user = await pb.collection('users').create(fd)

      await pb.collection('card_holders').create({
        user_id: user.id,
        company_id: data.company_id,
        total_limit: data.total_limit,
        used_limit: 0,
        status: 'active',
        cpf: data.cpf,
        address: data.address,
        cep: data.cep,
        whatsapp: data.whatsapp,
        card_type: data.card_type,
        credit_source: data.credit_source,
      })

      if (data.credit_source === 'asaas') {
        toast.info('Integração Asaas iniciada. O gateway processará a criação.')
      }

      toast.success('Titular criado com sucesso!')
      onSuccess()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', mask }: any) => (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        {...register(name, {
          onChange: mask ? (e) => (e.target.value = mask(e.target.value)) : undefined,
        })}
      />
      {errors[name as keyof FormData] && (
        <span className="text-xs text-red-500">
          {(errors[name as keyof FormData] as any).message}
        </span>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Nome Completo" name="name" />
        </div>
        <Field label="Email de Acesso" name="email" type="email" />
        <Field label="Senha de Acesso" name="password" type="password" />
        <div className="col-span-2">
          <Label>Foto / Avatar</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
        </div>
        <div className="col-span-2">
          <Label>Vincular a Empresa</Label>
          <Select onValueChange={(v) => setValue('company_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa parceira" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.company_id && (
            <span className="text-xs text-red-500">{errors.company_id.message}</span>
          )}
        </div>
        <Field label="CPF" name="cpf" mask={mCpf} />
        <Field label="WhatsApp" name="whatsapp" mask={mTel} />
        <div className="col-span-2">
          <Field label="Endereço Completo" name="address" />
        </div>
        <Field label="CEP" name="cep" mask={mCep} />
        <Field label="Limite (R$)" name="total_limit" type="number" />

        <div>
          <Label>Tipo de Cartão</Label>
          <Select
            onValueChange={(v) => setValue('card_type', v as any)}
            defaultValue="physical_virtual"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical_virtual">Físico e Virtual</SelectItem>
              <SelectItem value="virtual_only">Somente Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fonte de Crédito</Label>
          <Select
            onValueChange={(v) => setValue('credit_source', v as any)}
            defaultValue="proprietary"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proprietary">Crédito Próprio</SelectItem>
              <SelectItem value="asaas">Integração Asaas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full mt-4" disabled={loading}>
        {loading ? 'Salvando...' : 'Cadastrar Titular'}
      </Button>
    </form>
  )
}
