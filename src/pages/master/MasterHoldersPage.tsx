import { useState, useEffect } from 'react'
import { Plus, Search, Trash } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    user_id: '',
    company_id: '',
    card_number: '',
    total_limit: 0,
    used_limit: 0,
    status: 'active',
    cpf: '',
    card_type: 'physical_virtual',
    credit_source: 'proprietary',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [holdersRes, companiesRes, usersRes] = await Promise.all([
        pb
          .collection('card_holders')
          .getFullList({ expand: 'user_id,company_id', sort: '-created' }),
        pb.collection('companies').getFullList({ sort: 'name' }),
        pb.collection('users').getFullList({ sort: 'name' }),
      ])
      setHolders(holdersRes)
      setCompanies(companiesRes)
      setUsers(usersRes.filter((u) => u.role === 'holder' || !u.role))
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredHolders = holders.filter(
    (h) =>
      (h.expand?.user_id?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.cpf || '').includes(search) ||
      (h.card_number || '').includes(search),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.user_id || !formData.company_id) {
        toast({
          title: 'Atenção',
          description: 'Selecione um usuário e uma empresa',
          variant: 'destructive',
        })
        return
      }

      await pb.collection('card_holders').create(formData)
      toast({ title: 'Sucesso', description: 'Portador criado com sucesso' })
      setIsModalOpen(false)
      setFormData({
        user_id: '',
        company_id: '',
        card_number: '',
        total_limit: 0,
        used_limit: 0,
        status: 'active',
        cpf: '',
        card_type: 'physical_virtual',
        credit_source: 'proprietary',
      })
      loadData()
    } catch (err: any) {
      const errors = extractFieldErrors(err)
      toast({
        title: 'Erro ao criar',
        description: Object.values(errors)[0] || 'Verifique os dados informados',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este portador?')) return
    try {
      await pb.collection('card_holders').delete(id)
      toast({ title: 'Sucesso', description: 'Portador excluído' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Portadores</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os cartões e limites dos usuários</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Portador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Portador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(val) => setFormData({ ...formData, user_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(val) => setFormData({ ...formData, company_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número do Cartão</Label>
                  <Input
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite Total (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, total_limit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Cartão</Label>
                  <Select
                    value={formData.card_type}
                    onValueChange={(val) => setFormData({ ...formData, card_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical_virtual">Físico e Virtual</SelectItem>
                      <SelectItem value="virtual_only">Apenas Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fonte de Crédito</Label>
                  <Select
                    value={formData.credit_source}
                    onValueChange={(val) => setFormData({ ...formData, credit_source: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietary">Próprio</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Salvar Portador</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF ou cartão..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Limites</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredHolders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum portador encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredHolders.map((holder) => (
                <TableRow key={holder.id}>
                  <TableCell className="font-medium">
                    {holder.expand?.user_id?.name || holder.expand?.user_id?.email || 'N/A'}
                  </TableCell>
                  <TableCell>{holder.expand?.company_id?.name || 'N/A'}</TableCell>
                  <TableCell>{holder.cpf || '-'}</TableCell>
                  <TableCell>
                    R$ {(holder.used_limit || 0).toFixed(2)} / R${' '}
                    {(holder.total_limit || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        holder.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : holder.status === 'blocked'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {holder.status === 'active'
                        ? 'Ativo'
                        : holder.status === 'blocked'
                          ? 'Bloqueado'
                          : 'Cancelado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(holder.id)}>
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
